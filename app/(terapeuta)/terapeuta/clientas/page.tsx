import { ClientaCard } from '@/components/terapeuta/ClientaCard'
import { ClientasFilters } from '@/components/terapeuta/ClientasFilters'
import { TherapistSidebar } from '@/components/terapeuta/TherapistSidebar'
import {
  getTherapistDashboardData,
  normalizeFilter,
  normalizeSort,
} from '@/lib/terapeuta/dashboard'

export default async function TherapistClientasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filtro?: string; ordenar?: string }>
}) {
  const params = await searchParams
  const activeFilter = normalizeFilter(params.filtro)
  const activeSort = normalizeSort(params.ordenar)
  const data = await getTherapistDashboardData({
    searchTerm: params.q ?? '',
    filter: activeFilter,
    sort: activeSort,
  })

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-on-surface antialiased">
      <TherapistSidebar therapistName={data.therapistName} therapistAvatarUrl={data.therapistAvatarUrl} activePath="/terapeuta/clientas" />

      <main className="min-h-screen p-container-padding-mobile md:ml-64 md:p-container-padding-desktop">
        <header className="mb-16">
          <div className="relative mb-8">
            <div className="absolute -left-10 top-6 hidden h-px w-8 bg-primary opacity-30 md:block" />
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-outline">Mis Clientas</p>
            <h1 className="mb-4 font-serif text-[44px] leading-tight tracking-tight text-on-background">
              Seguimiento de<br />
              <span className="italic text-primary">Clientas</span>
            </h1>
            <p className="max-w-xl text-[17px] leading-relaxed text-[#795541]">
              Visualiza el estado actual de tus pacientes y encuentra rápido a quién querés revisar.
            </p>
          </div>

          <ClientasFilters
            basePath="/terapeuta/clientas"
            searchTerm={data.searchTerm}
            activeFilter={activeFilter}
            activeSort={activeSort}
            filterCounts={data.filterCounts}
            showing={data.clientas.length}
            total={data.totalClientas}
          />
        </header>

        {data.clientas.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {data.clientas.map((clienta) => (
              <ClientaCard key={clienta.id} clienta={clienta} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-[0.5px] border-outline-variant bg-surface-container-lowest p-8 text-on-surface-variant shadow-[0px_4px_24px_rgba(142,53,74,0.03)]">
            {data.totalClientas > 0
              ? 'No encontramos clientas con esa búsqueda.'
              : 'Todavía no hay clientas asignadas a tu perfil.'}
          </div>
        )}
      </main>
    </div>
  )
}
