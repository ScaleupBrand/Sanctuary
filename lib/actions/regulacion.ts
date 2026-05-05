'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { saveClientSessionPrep } from '@/lib/actions/session-prep'

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
  const userId = await getUserId()

  // Build combined text for the preguntas_para_llevar field
  const combinedNotes = [
    data.tema_principal ? `Tema: ${data.tema_principal}` : '',
    data.emocion_dominante ? `Emoción: ${data.emocion_dominante}` : '',
  ].filter(Boolean).join('\n')

  if (!combinedNotes.trim()) {
    return { error: 'Completa al menos un campo.' }
  }

  const result = await saveClientSessionPrep(userId, combinedNotes)
  if (result.error) return result

  revalidatePath('/regulacion')
  revalidatePath('/inicio')
  return { success: true }
}

// ─── Complete regulation practice ───────────────────────────────────────────
export async function completeRegulationPractice(formData: FormData) {
  const herramientaId = String(formData.get('herramienta_id') ?? '').trim()

  if (!herramientaId) redirect('/regulacion')

  const supabase = await createClient()
  const userId = await getUserId()

  const { data: herramienta } = await supabase
    .from('herramientas')
    .select('id')
    .eq('id', herramientaId)
    .eq('activa', true)
    .single()

  if (!herramienta) redirect('/regulacion')

  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  const { data: existingUsage } = await supabase
    .from('uso_herramientas')
    .select('id')
    .eq('usuario_id', userId)
    .eq('herramienta_id', herramientaId)
    .gte('fecha', startOfDay.toISOString())
    .lt('fecha', endOfDay.toISOString())
    .limit(1)
    .maybeSingle()

  if (existingUsage) {
    const { error } = await supabase
      .from('uso_herramientas')
      .update({ completada: true, fecha: now.toISOString() })
      .eq('id', existingUsage.id)
      .eq('usuario_id', userId)

    if (error) {
      console.error('Error updating regulation usage:', error)
      redirect('/regulacion')
    }
  } else {
    const { error } = await supabase.from('uso_herramientas').insert({
      usuario_id: userId,
      herramienta_id: herramientaId,
      fecha: now.toISOString(),
      completada: true,
    })

    if (error) {
      console.error('Error completing regulation practice:', error)
      redirect('/regulacion')
    }
  }

  revalidatePath('/regulacion')
  redirect('/regulacion')
}
