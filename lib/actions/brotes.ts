'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

export async function saveBrote(formData: {
  zona_corporal: string
  intensidad: number
  posible_causa: string
  que_paso_antes: string
  que_hizo_para_regularse: string
  sigue_activo: boolean
  duracion_estimada: string
}) {
  const supabase = await createClient()
  const userId = await getUserId()

  const { error } = await supabase.from('brotes').insert({
    usuario_id: userId,
    zona_corporal: formData.zona_corporal,
    intensidad: formData.intensidad,
    posible_causa: formData.posible_causa,
    que_paso_antes: formData.que_paso_antes,
    que_hizo_para_regularse: formData.que_hizo_para_regularse,
    sigue_activo: formData.sigue_activo,
    duracion_estimada: formData.duracion_estimada || null,
  })

  if (error) {
    console.error('Error saving brote:', error)
    return { error: 'No se pudo guardar el registro del brote.' }
  }

  revalidatePath('/inicio')
  revalidatePath('/brote')
  return { success: true }
}
