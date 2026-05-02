'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
    .single()

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
    const checkin = checkins?.find((c: any) => c.fecha === fecha)
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
export async function skipCheckin(clinicalDate: string) {
  const supabase = await createClient()
  const userId = await getUserId()

  const { error } = await supabase.from('checkins').insert({
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

  // Check if one exists already for today
  const { data: existing } = await supabase
    .from('checkins')
    .select('id')
    .eq('usuario_id', userId)
    .eq('fecha', clinicalDate)
    .single()

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

  let error
  if (existing) {
    // Update existing check-in
    const result = await supabase
      .from('checkins')
      .update(payload)
      .eq('id', existing.id)
    error = result.error
  } else {
    // Insert new
    const result = await supabase.from('checkins').insert(payload)
    error = result.error
  }

  if (error) {
    console.error('Error saving checkin:', error)
    return { error: 'No se pudo guardar el registro.' }
  }

  revalidatePath('/inicio')
  return { success: true }
}

// ─── Save session notes ──────────────────────────────────────────────────────
export async function saveSessionNotes(notes: string) {
  const supabase = await createClient()
  const userId = await getUserId()

  // Check if there is already a pending session (upcoming) to update
  const { data: existing } = await supabase
    .from('sesiones')
    .select('id')
    .eq('usuario_id', userId)
    .order('fecha_programada', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    // Update notes on the most recent session
    const { error } = await supabase
      .from('sesiones')
      .update({ preguntas_para_llevar: notes })
      .eq('id', existing.id)

    if (error) {
      console.error('Error updating session notes:', error)
      return { error: 'No se pudieron guardar las notas.' }
    }
  } else {
    // Create a new session entry with just the notes
    const { error } = await supabase.from('sesiones').insert({
      usuario_id: userId,
      fecha_programada: new Date().toISOString(),
      preguntas_para_llevar: notes,
    })

    if (error) {
      console.error('Error creating session:', error)
      return { error: 'No se pudieron guardar las notas.' }
    }
  }

  revalidatePath('/inicio')
  return { success: true }
}
