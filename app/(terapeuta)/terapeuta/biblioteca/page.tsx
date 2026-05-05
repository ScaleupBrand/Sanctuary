import { redirect } from 'next/navigation'
import { BibliotecaClient, type BibliotecaResource } from '@/components/terapeuta/BibliotecaClient'
import { TherapistSidebar } from '@/components/terapeuta/TherapistSidebar'
import { createClient } from '@/lib/supabase/server'

type AppRole = 'clienta' | 'terapeuta' | 'admin'

async function getBibliotecaData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: therapist } = await supabase
    .from('users')
    .select('id, nombre, rol, avatar_url')
    .eq('id', user.id)
    .single()

  const role = therapist?.rol as AppRole | undefined
  if (!therapist || (role !== 'terapeuta' && role !== 'admin')) redirect('/inicio')

  const { data: herramientas } = await supabase
    .from('herramientas')
    .select('id, nombre, tipo, categoria, duracion, archivo_url, contenido, activa')
    .in('categoria', ['respiracion', 'enraizamiento', 'movimiento'])
    .order('categoria', { ascending: true })
    .order('created_at', { ascending: false })

  return {
    therapistName: therapist.nombre,
    therapistAvatarUrl: therapist.avatar_url as string | null,
    resources: (herramientas ?? []) as BibliotecaResource[],
  }
}

export default async function TherapistBibliotecaPage() {
  const { therapistName, therapistAvatarUrl, resources } = await getBibliotecaData()

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-on-surface antialiased">
      <TherapistSidebar therapistName={therapistName} therapistAvatarUrl={therapistAvatarUrl} activePath="/terapeuta/biblioteca" />

      <main className="relative min-h-screen overflow-hidden p-container-padding-mobile md:ml-64 md:p-container-padding-desktop">
        <div
          className="pointer-events-none fixed right-0 top-0 z-0 h-full w-full opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(#8E354A 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="relative z-10 mx-auto w-full max-w-[1400px] pb-20">
          <BibliotecaClient resources={resources} />
        </div>
      </main>
    </div>
  )
}
