import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type AppRole = 'clienta' | 'terapeuta' | 'admin'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('estado, onboarding_completado, rol')
    .eq('id', user.id)
    .single()

  const role = profile?.rol as AppRole | undefined

  if (role === 'terapeuta' || role === 'admin') redirect('/terapeuta/dashboard')
  if (profile?.estado !== 'activo') redirect('/inicio')
  if (!profile?.onboarding_completado) redirect('/onboarding/bienvenida')

  redirect('/inicio')
}
