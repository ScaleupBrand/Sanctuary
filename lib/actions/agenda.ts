'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type AppRole = 'clienta' | 'terapeuta' | 'admin'

export type AgendaActionState = {
  error?: string
  success?: string
}

async function requireTherapist() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { supabase, userId: null, role: null, error: 'Necesitás iniciar sesión.' }

  const { data: profile } = await supabase
    .from('users')
    .select('rol')
    .eq('id', user.id)
    .single()

  const role = profile?.rol as AppRole | undefined
  if (role !== 'terapeuta' && role !== 'admin') {
    return { supabase, userId: null, role: null, error: 'No tenés permisos para esta acción.' }
  }

  return { supabase, userId: user.id, role, error: null }
}

async function canManageClienta(clientaId: string, therapistId: string, role: AppRole) {
  const supabase = await createClient()
  const query = supabase
    .from('users')
    .select('id')
    .eq('id', clientaId)
    .eq('rol', 'clienta')

  const { data } = role === 'admin'
    ? await query.single()
    : await query.eq('terapeuta_asignada', therapistId).single()

  return Boolean(data)
}

export async function scheduleSession(
  _previousState: AgendaActionState,
  formData: FormData
): Promise<AgendaActionState> {
  const clientaId = String(formData.get('clienta_id') ?? '').trim()
  const fecha = String(formData.get('fecha') ?? '').trim()
  const hora = String(formData.get('hora') ?? '').trim()
  const notasPrevias = String(formData.get('notas_previas') ?? '').trim()

  if (!clientaId || !fecha || !hora) {
    return { error: 'Elegí clienta, fecha y hora.' }
  }

  const fechaHora = new Date(`${fecha}T${hora}:00`)
  if (Number.isNaN(fechaHora.getTime())) {
    return { error: 'La fecha u hora no es válida.' }
  }

  const { supabase, userId, role, error: authError } = await requireTherapist()
  if (authError || !userId || !role) return { error: authError ?? 'No se pudo validar tu sesión.' }

  const allowed = await canManageClienta(clientaId, userId, role)
  if (!allowed) return { error: 'Esa clienta no está asignada a tu perfil.' }

  const { error } = await supabase.from('sesiones_agendadas').insert({
    terapeuta_id: userId,
    clienta_id: clientaId,
    fecha_hora: fechaHora.toISOString(),
    notas_previas: notasPrevias || null,
    estado: 'programada',
  })

  if (error) {
    console.error('Error scheduling session:', error)
    return { error: 'No se pudo agendar la sesión.' }
  }

  revalidatePath('/terapeuta/agenda')
  revalidatePath('/inicio')
  return { success: 'Sesión agendada.' }
}

export async function cancelScheduledSession(formData: FormData) {
  const sessionId = String(formData.get('id') ?? '').trim()
  if (!sessionId) return

  const { supabase, userId, role, error: authError } = await requireTherapist()
  if (authError || !userId || !role) return

  const { data: session } = await supabase
    .from('sesiones_agendadas')
    .select('id, terapeuta_id')
    .eq('id', sessionId)
    .single()

  if (!session) return
  if (role !== 'admin' && session.terapeuta_id !== userId) return

  const { error } = await supabase
    .from('sesiones_agendadas')
    .update({ estado: 'cancelada' })
    .eq('id', sessionId)

  if (error) {
    console.error('Error canceling session:', error)
    return
  }

  revalidatePath('/terapeuta/agenda')
  revalidatePath('/inicio')
}

export async function getUpcomingClientSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('sesiones_agendadas')
    .select('id, fecha_hora, notas_previas, estado')
    .eq('clienta_id', user.id)
    .eq('estado', 'programada')
    .gte('fecha_hora', new Date().toISOString())
    .order('fecha_hora', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching upcoming client session:', error)
    return null
  }

  return data
}
