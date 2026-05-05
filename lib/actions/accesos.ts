'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type PendingAccessUser = {
  id: string
  nombre: string
  email: string
  created_at: string
}

export type ActiveAccessUser = {
  id: string
  nombre: string
  email: string
  created_at: string
}

export type AccessActionResult = {
  error?: string
  success?: string
  id?: string
  link?: string
  email?: string
}

export type PendingAccessResult = {
  users: PendingAccessUser[]
  error?: string
}

export type ActiveAccessResult = {
  users: ActiveAccessUser[]
  error?: string
}

async function requireTherapist() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { userId: null, error: 'Necesitás iniciar sesión.' }

  const { data: profile } = await supabase
    .from('users')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (profile?.rol !== 'terapeuta' && profile?.rol !== 'admin') {
    return { userId: null, error: 'No tenés permisos para gestionar accesos.' }
  }

  return { userId: user.id, role: profile.rol as 'terapeuta' | 'admin', error: null }
}

function getAdminOrError() {
  try {
    return { admin: createAdminClient(), error: null }
  } catch (error) {
    console.error('Supabase admin client error:', error)
    return { admin: null, error: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en el entorno.' }
  }
}

async function resolveAssignedTherapistId(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  role: 'terapeuta' | 'admin'
) {
  if (role === 'terapeuta') return userId

  const defaultTherapistEmail = process.env.DEFAULT_THERAPIST_EMAIL || process.env.NEXT_PUBLIC_DEFAULT_THERAPIST_EMAIL
  if (defaultTherapistEmail) {
    const { data: defaultTherapist } = await admin
      .from('users')
      .select('id')
      .eq('rol', 'terapeuta')
      .eq('estado', 'activo')
      .ilike('email', defaultTherapistEmail)
      .maybeSingle()

    if (defaultTherapist?.id) return defaultTherapist.id as string
  }

  const { data: firstTherapist } = await admin
    .from('users')
    .select('id')
    .eq('rol', 'terapeuta')
    .eq('estado', 'activo')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  return (firstTherapist?.id as string | undefined) ?? userId
}

export async function getPendingAccessRequests(): Promise<PendingAccessResult> {
  const { error: authError } = await requireTherapist()
  if (authError) return { users: [], error: authError }

  const { admin, error: adminError } = getAdminOrError()
  if (adminError || !admin) return { users: [], error: adminError ?? 'No se pudo conectar con Supabase Admin.' }

  const { data, error } = await admin
    .from('users')
    .select('id, nombre, email, created_at')
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error loading pending access requests:', error)
    return { users: [], error: 'No se pudieron cargar las solicitudes pendientes.' }
  }

  return { users: (data ?? []) as PendingAccessUser[] }
}

export async function getActiveClientAccesses(): Promise<ActiveAccessResult> {
  const { userId, role, error: authError } = await requireTherapist()
  if (authError || !userId || !role) return { users: [], error: authError ?? 'No se pudo validar tu sesión.' }

  const { admin, error: adminError } = getAdminOrError()
  if (adminError || !admin) return { users: [], error: adminError ?? 'No se pudo conectar con Supabase Admin.' }

  let query = admin
    .from('users')
    .select('id, nombre, email, created_at')
    .eq('rol', 'clienta')
    .eq('estado', 'activo')
    .order('nombre', { ascending: true })

  if (role === 'terapeuta') {
    query = query.eq('terapeuta_asignada', userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error loading active client accesses:', error)
    return { users: [], error: 'No se pudieron cargar las clientas con acceso.' }
  }

  return { users: (data ?? []) as ActiveAccessUser[] }
}

export async function approveAccessRequest(id: string): Promise<AccessActionResult> {
  const { userId, role, error: authError } = await requireTherapist()
  if (authError || !userId || !role) return { error: authError ?? 'No se pudo validar tu sesión.' }

  const { admin, error: adminError } = getAdminOrError()
  if (adminError || !admin) return { error: adminError ?? 'No se pudo conectar con Supabase Admin.' }

  const assignedTherapistId = await resolveAssignedTherapistId(admin, userId, role)

  const { error } = await admin
    .from('users')
    .update({
      estado: 'activo',
      terapeuta_asignada: assignedTherapistId,
    })
    .eq('id', id)
    .eq('estado', 'pendiente')

  if (error) {
    console.error('Error approving access request:', error)
    return { error: 'No se pudo aprobar la solicitud.' }
  }

  revalidatePath('/terapeuta/accesos')
  revalidatePath('/terapeuta/clientas')
  return { success: 'Acceso aprobado.', id }
}

export async function revokeClientAccess(id: string): Promise<AccessActionResult> {
  const { userId, role, error: authError } = await requireTherapist()
  if (authError || !userId || !role) return { error: authError ?? 'No se pudo validar tu sesión.' }

  const { admin, error: adminError } = getAdminOrError()
  if (adminError || !admin) return { error: adminError ?? 'No se pudo conectar con Supabase Admin.' }

  let query = admin
    .from('users')
    .update({ estado: 'inactivo' })
    .eq('id', id)
    .eq('rol', 'clienta')
    .eq('estado', 'activo')

  if (role === 'terapeuta') {
    query = query.eq('terapeuta_asignada', userId)
  }

  const { error } = await query

  if (error) {
    console.error('Error revoking client access:', error)
    return { error: 'No se pudo revocar el acceso.' }
  }

  revalidatePath('/terapeuta/accesos')
  revalidatePath('/terapeuta/clientas')
  return { success: 'Acceso revocado.', id }
}

export async function rejectAccessRequest(id: string): Promise<AccessActionResult> {
  const { error: authError } = await requireTherapist()
  if (authError) return { error: authError }

  const { admin, error: adminError } = getAdminOrError()
  if (adminError || !admin) return { error: adminError ?? 'No se pudo conectar con Supabase Admin.' }

  const { error } = await admin
    .from('users')
    .update({ estado: 'rechazado' })
    .eq('id', id)
    .eq('estado', 'pendiente')

  if (error) {
    console.error('Error rejecting access request:', error)
    return { error: 'No se pudo rechazar la solicitud.' }
  }

  revalidatePath('/terapeuta/accesos')
  return { success: 'Solicitud rechazada.', id }
}

export async function generateClientAccessLink(email: string): Promise<AccessActionResult> {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail) return { error: 'Ingresá un email.' }

  const { userId, role, error: authError } = await requireTherapist()
  if (authError || !userId || !role) return { error: authError ?? 'No se pudo validar tu sesión.' }

  const { admin, error: adminError } = getAdminOrError()
  if (adminError || !admin) return { error: adminError ?? 'No se pudo conectar con Supabase Admin.' }

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'invite',
    email: cleanEmail,
  })

  if (error) {
    console.error('Error generating access link:', error)
    return { error: 'No se pudo generar el enlace de acceso.' }
  }

  if (data.user) {
    const assignedTherapistId = await resolveAssignedTherapistId(admin, userId, role)
    const fallbackName = cleanEmail.split('@')[0] || 'Clienta'
    const { error: profileError } = await admin
      .from('users')
      .upsert({
        id: data.user.id,
        email: cleanEmail,
        nombre: typeof data.user.user_metadata?.full_name === 'string'
          ? data.user.user_metadata.full_name
          : fallbackName,
        rol: 'clienta',
        estado: 'activo',
        terapeuta_asignada: assignedTherapistId,
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Error upserting invited client profile:', profileError)
      return { error: 'Se generó el enlace, pero no se pudo crear el perfil.' }
    }
  }

  revalidatePath('/terapeuta/accesos')
  revalidatePath('/terapeuta/clientas')
  return {
    success: 'Enlace generado correctamente.',
    link: data.properties?.action_link,
    email: cleanEmail,
  }
}
