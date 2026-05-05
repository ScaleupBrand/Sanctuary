import { TherapistSettingsClient } from '@/components/terapeuta/ajustes/TherapistSettingsClient'
import { TherapistSidebar } from '@/components/terapeuta/TherapistSidebar'
import { getTherapistSettingsData } from '@/lib/actions/terapeuta-ajustes'

export default async function TherapistSettingsPage() {
  const data = await getTherapistSettingsData()

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-on-surface antialiased">
      <TherapistSidebar therapistName={data.nombre} therapistAvatarUrl={data.avatarUrl} activePath="/terapeuta/ajustes" />

      <main className="relative min-h-screen overflow-hidden p-container-padding-mobile md:ml-64 md:p-container-padding-desktop">
        <div
          className="pointer-events-none fixed right-0 top-0 z-0 h-full w-full opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(#8E354A 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="relative z-10 mx-auto w-full max-w-[1200px] pb-20">
          <TherapistSettingsClient initialData={data} />
        </div>
      </main>
    </div>
  )
}
