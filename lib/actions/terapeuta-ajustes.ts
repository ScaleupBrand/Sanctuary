'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type AppRole = 'clienta' | 'terapeuta' | 'admin'

async function getAuthenticatedTherapist() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile, error } = await supabase
    .from('users')
    .select('id, nombre, email, rol, avatar_url')
    .eq('id', user.id)
    .single()

  const role = profile?.rol as AppRole | undefined
  if (error || !profile || (role !== 'terapeuta' && role !== 'admin')) {
    redirect('/inicio')
  }

  return {
    supabase,
    user,
    profile,
  }
}

export async function getTherapistSettingsData() {
  const { user, profile } = await getAuthenticatedTherapist()

  return {
    nombre: profile.nombre || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Terapeuta',
    email: profile.email || user.email || '',
    avatarUrl: (profile.avatar_url as string | null) ?? null,
  }
}

export async function updateTherapistName(nombre: string) {
  const cleanName = nombre.trim()
  if (!cleanName) return { success: false, error: 'El nombre no puede estar vacío' }

  const { supabase, user } = await getAuthenticatedTherapist()

  const { error } = await supabase
    .from('users')
    .update({ nombre: cleanName })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/terapeuta/ajustes')
  revalidatePath('/terapeuta/dashboard')
  return { success: true }
}

export async function updateTherapistAvatar(formData: FormData) {
  const { supabase, user } = await getAuthenticatedTherapist()
  const file = formData.get('avatar') as File | null

  if (!file || file.size === 0) return { success: false, error: 'No se recibió ningún archivo' }
  if (!file.type.startsWith('image/')) return { success: false, error: 'El archivo debe ser una imagen' }

  const fileExt = file.name.split('.').pop() || 'jpg'
  const fileName = `${user.id}/therapist-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) return { success: false, error: uploadError.message }

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)

  const { error: updateError } = await supabase
    .from('users')
    .update({ avatar_url: urlData.publicUrl })
    .eq('id', user.id)

  if (updateError) return { success: false, error: updateError.message }

  revalidatePath('/terapeuta/ajustes')
  revalidatePath('/terapeuta/dashboard')
  return { success: true, avatarUrl: urlData.publicUrl }
}
