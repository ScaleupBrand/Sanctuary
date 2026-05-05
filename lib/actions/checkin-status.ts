'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { saveClientSessionPrep } from '@/lib/actions/session-prep'

type WeeklyCheckinRow = {
  fecha: string
  energia: number | null
  omitido: boolean | null
}

async function getUserId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

// ─── Clinical date calculation ───────────────────────────────────────────────
async function getClinicalDate() {
  const supabase = await createClient()
  const userId = await getUserId()

  const { data: perfil } = await supabase
    .from('perfil_clinico_inicial')
    .select('hora_checkin')
    .eq('usuario_id', userId)
    .single()

  const cutoffTime = perfil?.hora_checkin || '08:00:00'
  const now = new Date()
  const [cutoffHour, cutoffMinute] = cutoffTime.split(':').map(Number)
  const isBeforeCutoff = now.getHours() < cutoffHour || (now.getHours() === cutoffHour && now.getMinutes() < cutoffMinute)

  const clinicalDateObj = new Date(now)
  if (isBeforeCutoff) clinicalDateObj.setDate(clinicalDateObj.getDate() - 1)

  const year = clinicalDateObj.getFullYear()
  const month = String(clinicalDateObj.getMonth() + 1).padStart(2, '0')
  const day = String(clinicalDateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ─── Get full check-in status + today's data ─────────────────────────────────
export async function getCheckinStatus() {
  const supabase = await createClient()
  const userId = await getUserId()
  const clinicalDate = await getClinicalDate()

  const { data: existingCheckin } = await supabase
    .from('checkins')
    .select('*')
    .eq('usuario_id', userId)
    .eq('fecha', clinicalDate)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return {
    isPending: !existingCheckin,
    clinicalDate,
    todayCheckin: existingCheckin || null,
  }
}

// ─── Get last 7 days of check-in data ────────────────────────────────────────
export async function getWeeklyHistory() {
  const supabase = await createClient()
  const userId = await getUserId()

  // Build an array of the last 7 dates
  const today = new Date()
  const days: string[] = []
  const dayLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    days.push(`${year}-${month}-${day}`)
  }

  const { data: checkins } = await supabase
    .from('checkins')
    .select('fecha, energia, omitido')
    .eq('usuario_id', userId)
    .in('fecha', days)

  return days.map((fecha) => {
    const d = new Date(fecha + 'T12:00:00')
    const dayLabel = dayLabels[d.getDay()]
    const checkin = (checkins as WeeklyCheckinRow[] | null)?.find((c) => c.fecha === fecha)
    return {
      day: dayLabel,
      fecha,
      energia: checkin?.energia ?? 0,
      omitido: checkin?.omitido ?? false,
      registered: !!checkin && !checkin.omitido,
    }
  })
}

// ─── Skip check-in ──────────────────────────────────────────────────────────
export async function skipCheckin() {
  const supabase = await createClient()
  const userId = await getUserId()
  const clinicalDate = await getClinicalDate()

  const { data: existing } = await supabase
    .from('checkins')
    .select('id')
    .eq('usuario_id', userId)
    .eq('fecha', clinicalDate)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = existing
    ? await supabase
        .from('checkins')
        .update({ omitido: true })
        .eq('usuario_id', userId)
        .eq('fecha', clinicalDate)
    : await supabase.from('checkins').insert({
        usuario_id: userId,
        fecha: clinicalDate,
        omitido: true,
      })

  if (error) {
    console.error('Error skipping checkin:', error)
    return { error: 'No se pudo saltar el registro' }
  }

  revalidatePath('/inicio')
  return { success: true }
}

// ─── Create or Update check-in (upsert) ─────────────────────────────────────
export async function saveCheckin(formData: {
  energia: number
  dolor: number
  alerta_ansiedad: number
  sueno: string
  hubo_brote: boolean
  nota_libre: string
}) {
  const supabase = await createClient()
  const userId = await getUserId()
  const clinicalDate = await getClinicalDate()

  const payload = {
    usuario_id: userId,
    fecha: clinicalDate,
    energia: formData.energia,
    dolor: formData.dolor,
    alerta_ansiedad: formData.alerta_ansiedad,
    sueno: formData.sueno,
    hubo_brote: formData.hubo_brote,
    nota_libre: formData.nota_libre,
    omitido: false,
  }

  const { data: existing } = await supabase
    .from('checkins')
    .select('id')
    .eq('usuario_id', userId)
    .eq('fecha', clinicalDate)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = existing
    ? await supabase
        .from('checkins')
        .update(payload)
        .eq('usuario_id', userId)
        .eq('fecha', clinicalDate)
    : await supabase.from('checkins').insert(payload)

  if (error) {
    console.error('Error saving checkin:', error)
    return { error: 'No se pudo guardar el registro.' }
  }

  revalidatePath('/inicio')
  return { success: true }
}

// ─── Save session notes ──────────────────────────────────────────────────────
export async function saveSessionNotes(notes: string) {
  const userId = await getUserId()

  const result = await saveClientSessionPrep(userId, notes)
  if (result.error) return { error: 'No se pudieron guardar las notas.' }

  revalidatePath('/inicio')
  revalidatePath('/regulacion')
  return { success: true }
}
