'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

export async function getAjustesData() {
  const supabase = await createClient()
  const userId = await getUserId()

  let { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('nombre, avatar_url, notificaciones_activas')
    .eq('id', userId)
    .single()

  if (profileError) {
    if (profileError.code === 'PGRST116') {
      // Create default profile if missing
      await supabase.from('users').insert({
        id: userId,
        nombre: 'Usuario',
        estado: 'pendiente'
      })
      userProfile = { nombre: 'Usuario', avatar_url: null, notificaciones_activas: true }
    } else {
      console.error('profileError:', profileError.code, profileError.message, profileError.details)
      throw new Error(`Error fetching profile: ${profileError.message}`)
    }
  }

  const { data: clinicoData, error: clinicoError } = await supabase
    .from('perfil_clinico_inicial')
    .select('hora_checkin')
    .eq('usuario_id', userId)
    .single()

  // It's possible that perfil_clinico_inicial doesn't exist yet, we can handle it gracefully
  if (clinicoError && clinicoError.code !== 'PGRST116') {
    throw new Error('Error fetching clinical profile')
  }

  return {
    nombre: userProfile.nombre,
    avatarUrl: userProfile.avatar_url,
    notificacionesActivas: userProfile.notificaciones_activas !== false, // default true if null
    horaCheckin: clinicoData?.hora_checkin || '20:00'
  }
}

export async function updateNombre(nombre: string) {
  const supabase = await createClient()
  const userId = await getUserId()

  const { error } = await supabase
    .from('users')
    .update({ nombre })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/ajustes')
  revalidatePath('/inicio')
  return { success: true }
}

export async function updateAvatar(formData: FormData) {
  const supabase = await createClient()
  const userId = await getUserId()
  const file = formData.get('avatar') as File
  
  if (!file) return { success: false, error: 'No file provided' }

  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`

  // Subir el archivo al bucket "avatars"
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (uploadError) return { success: false, error: uploadError.message }

  // Obtener la URL pública
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // Actualizar la tabla users
  const { error: updateError } = await supabase
    .from('users')
    .update({ avatar_url: urlData.publicUrl })
    .eq('id', userId)

  if (updateError) return { success: false, error: updateError.message }

  revalidatePath('/ajustes')
  revalidatePath('/inicio')
  return { success: true, avatarUrl: urlData.publicUrl }
}

export async function updateHoraCheckin(hora: string) {
  const supabase = await createClient()
  const userId = await getUserId()

  // First verify if perfil_clinico_inicial exists
  const { data: clinico } = await supabase
    .from('perfil_clinico_inicial')
    .select('id')
    .eq('usuario_id', userId)
    .single()

  let error;
  if (clinico) {
    const { error: updateError } = await supabase
      .from('perfil_clinico_inicial')
      .update({ hora_checkin: hora })
      .eq('usuario_id', userId)
    error = updateError
  } else {
    const { error: insertError } = await supabase
      .from('perfil_clinico_inicial')
      .insert({ usuario_id: userId, hora_checkin: hora })
    error = insertError
  }

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/ajustes')
  return { success: true }
}

export async function updateNotificaciones(activas: boolean) {
  const supabase = await createClient()
  const userId = await getUserId()

  const { error } = await supabase
    .from('users')
    .update({ notificaciones_activas: activas })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/ajustes')
  return { success: true }
}
