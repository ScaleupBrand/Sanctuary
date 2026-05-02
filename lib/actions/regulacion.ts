'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

// ─── Save session preparation notes ─────────────────────────────────────────
export async function saveSessionPrep(data: {
  tema_principal: string
  emocion_dominante: string
}) {
  const supabase = await createClient()
  const userId = await getUserId()

  // Build combined text for the preguntas_para_llevar field
  const combinedNotes = [
    data.tema_principal ? `Tema: ${data.tema_principal}` : '',
    data.emocion_dominante ? `Emoción: ${data.emocion_dominante}` : '',
  ].filter(Boolean).join('\n')

  if (!combinedNotes.trim()) {
    return { error: 'Completa al menos un campo.' }
  }

  // Check for an existing upcoming session
  const { data: existing } = await supabase
    .from('sesiones')
    .select('id')
    .eq('usuario_id', userId)
    .order('fecha_programada', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('sesiones')
      .update({ preguntas_para_llevar: combinedNotes })
      .eq('id', existing.id)

    if (error) {
      console.error('Error updating session prep:', error)
      return { error: 'No se pudo guardar la preparación.' }
    }
  } else {
    const { error } = await supabase.from('sesiones').insert({
      usuario_id: userId,
      fecha_programada: new Date().toISOString(),
      preguntas_para_llevar: combinedNotes,
    })

    if (error) {
      console.error('Error creating session prep:', error)
      return { error: 'No se pudo guardar la preparación.' }
    }
  }

  revalidatePath('/regulacion')
  return { success: true }
}
