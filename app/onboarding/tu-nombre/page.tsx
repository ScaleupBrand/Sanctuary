import { createClient } from '@/lib/supabase/server'
import TuNombreClient from './TuNombreClient'

export default async function TuNombrePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initialData = { nombre: '', avatarUrl: null }
  
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('nombre, avatar_url')
      .eq('id', user.id)
      .single()
      
    if (profile) {
      initialData = {
        nombre: profile.nombre || '',
        avatarUrl: profile.avatar_url || null
      }
    }
  }

  return <TuNombreClient initialData={initialData} />
}
