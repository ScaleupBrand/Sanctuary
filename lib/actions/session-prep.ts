import { createClient } from '@/lib/supabase/server'

export async function saveClientSessionPrep(userId: string, notes: string) {
  const supabase = await createClient()
  const cleanNotes = notes.trim()

  if (!cleanNotes) return { error: 'Completá al menos un campo.' }

  const { data: upcomingScheduledSession } = await supabase
    .from('sesiones_agendadas')
    .select('terapeuta_id, fecha_hora')
    .eq('clienta_id', userId)
    .eq('estado', 'programada')
    .gte('fecha_hora', new Date().toISOString())
    .order('fecha_hora', { ascending: true })
    .limit(1)
    .maybeSingle()

  const fechaProgramada = upcomingScheduledSession?.fecha_hora ?? new Date().toISOString()
  const terapeutaId = upcomingScheduledSession?.terapeuta_id ?? null

  const { data: existing } = await supabase
    .from('sesiones')
    .select('id')
    .eq('usuario_id', userId)
    .eq('fecha_programada', fechaProgramada)
    .maybeSingle()

  const payload = {
    usuario_id: userId,
    terapeuta_id: terapeutaId,
    fecha_programada: fechaProgramada,
    preguntas_para_llevar: cleanNotes,
  }

  const { error } = existing
    ? await supabase
        .from('sesiones')
        .update({ preguntas_para_llevar: cleanNotes, terapeuta_id: terapeutaId })
        .eq('id', existing.id)
        .eq('usuario_id', userId)
    : await supabase.from('sesiones').insert(payload)

  if (error) {
    console.error('Error saving client session prep:', error)
    return { error: 'No se pudo guardar la preparación.' }
  }

  return { success: true }
}
