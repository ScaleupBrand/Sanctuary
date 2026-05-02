'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeOnboarding(hora: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Update hora_checkin
  const { data: clinico } = await supabase
    .from('perfil_clinico_inicial')
    .select('id')
    .eq('usuario_id', user.id)
    .single()

  let errorClinico
  if (clinico) {
    const { error } = await supabase
      .from('perfil_clinico_inicial')
      .update({ hora_checkin: hora })
      .eq('usuario_id', user.id)
    errorClinico = error
  } else {
    const { error } = await supabase
      .from('perfil_clinico_inicial')
      .insert({ usuario_id: user.id, hora_checkin: hora })
    errorClinico = error
  }

  if (errorClinico) {
    return { success: false, error: errorClinico.message }
  }

  // Set onboarding_completado to true
  const { error: usersError } = await supabase
    .from('users')
    .update({ onboarding_completado: true })
    .eq('id', user.id)

  if (usersError) {
    return { success: false, error: usersError.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
