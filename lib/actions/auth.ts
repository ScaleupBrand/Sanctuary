'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/login?error=missing-fields')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error.message)
    redirect('/login?error=invalid-credentials')
  }

  redirect('/inicio')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  if (!email || !password || !fullName) {
    redirect('/registro?error=missing-fields')
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    console.error('Signup error:', error.message)
    redirect('/registro?error=signup-failed')
  }

  // Insert the profile in public.users with 'pendiente' status
  if (data.user) {
    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      email: data.user.email,
      nombre: fullName,
      estado: 'pendiente',
    })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      redirect('/registro?error=profile-failed')
    }
  }

  redirect('/inicio')
}

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('users')
    .select('estado, avatar_url, nombre')
    .eq('id', user.id)
    .single()

  if (error?.code === 'PGRST116') {
    const fallbackName =
      typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()
        ? user.user_metadata.full_name.trim()
        : user.email?.split('@')[0] || 'Usuario'

    const { data: createdProfile } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email || '',
        nombre: fallbackName,
        estado: 'pendiente',
      })
      .select('estado, avatar_url, nombre')
      .single()

    return createdProfile
  }

  return profile
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
