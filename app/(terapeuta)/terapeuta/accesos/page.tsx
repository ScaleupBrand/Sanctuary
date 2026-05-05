import { AccesosClient } from '@/components/terapeuta/AccesosClient'
import { TherapistSidebar } from '@/components/terapeuta/TherapistSidebar'
import { getActiveClientAccesses, getPendingAccessRequests } from '@/lib/actions/accesos'
import { getTherapistDashboardData } from '@/lib/terapeuta/dashboard'

export default async function TherapistAccesosPage() {
  const [data, pendingAccess, activeAccess] = await Promise.all([
    getTherapistDashboardData({}),
    getPendingAccessRequests(),
    getActiveClientAccesses(),
  ])

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-on-surface antialiased">
      <TherapistSidebar therapistName={data.therapistName} therapistAvatarUrl={data.therapistAvatarUrl} activePath="/terapeuta/accesos" />
      <main className="min-h-screen p-container-padding-mobile md:ml-64 md:p-container-padding-desktop">
        <div className="relative mb-16">
          <div className="absolute -left-10 top-6 hidden h-px w-8 bg-primary opacity-30 md:block" />
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-outline">Accesos</p>
          <h1 className="mb-4 font-serif text-[44px] leading-tight tracking-tight text-on-background">
            Gestión de<br />
            <span className="italic text-primary">Accesos</span>
          </h1>
          <p className="max-w-xl text-[17px] leading-relaxed text-[#795541]">Sección reservada para aprobar o revisar accesos de clientas.</p>
        </div>

        <AccesosClient
          pendingUsers={pendingAccess.users}
          activeUsers={activeAccess.users}
          configError={pendingAccess.error || activeAccess.error}
        />
      </main>
    </div>
  )
}
