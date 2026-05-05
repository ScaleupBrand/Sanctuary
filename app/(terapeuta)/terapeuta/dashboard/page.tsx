import Link from 'next/link'
import { AlertCircle, ArrowRight, Clock, Users } from 'lucide-react'
import { ClientaCard } from '@/components/terapeuta/ClientaCard'
import { TherapistSidebar } from '@/components/terapeuta/TherapistSidebar'
import { getTherapistDashboardData, type UpcomingTherapistSession } from '@/lib/terapeuta/dashboard'

function formatSessionDate(value: string) {
  return new Date(value).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function relativeSessionLabel(value: string) {
  const diffMs = new Date(value).getTime() - Date.now()
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))

  if (diffHours <= 1) return 'Muy pronto'
  if (diffHours < 24) return `En ${diffHours} h`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays === 1) return 'Mañana'
  return `En ${diffDays} días`
}

function SessionCard({ session }: { session: UpcomingTherapistSession }) {
  return (
    <Link
      href={`/terapeuta/clienta/${session.clientaId}`}
      className="flex flex-col gap-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-[0_4px_24px_rgba(112,30,52,0.02)] transition-all hover:shadow-[0_8px_32px_rgba(112,30,52,0.05)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-container-high font-serif text-tertiary">
            {session.clientaInitials}
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold text-on-background">{session.clientaNombre}</h4>
            <p className="truncate text-[11px] text-on-surface-variant">{session.clientaEmail || 'Sesión programada'}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-surface-container px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
          {relativeSessionLabel(session.fechaHora)}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <Clock className="size-4" strokeWidth={1.8} />
        {formatSessionDate(session.fechaHora)}
      </div>

      {session.notasPrevias && (
        <p className="line-clamp-2 rounded-lg bg-surface-container-low p-3 text-sm italic leading-relaxed text-on-surface-variant">
          {session.notasPrevias}
        </p>
      )}
    </Link>
  )
}

export default async function TherapistDashboardPage() {
  const data = await getTherapistDashboardData({})
  const priorityClientas = data.priorityClientas.slice(0, 3)

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-on-surface antialiased">
      <TherapistSidebar therapistName={data.therapistName} therapistAvatarUrl={data.therapistAvatarUrl} activePath="/terapeuta/dashboard" />

      <main className="min-h-screen p-container-padding-mobile md:ml-64 md:p-container-padding-desktop">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-section-gap">
          <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="group relative overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-[0_4px_24px_rgba(112,30,52,0.03)] transition-colors hover:border-outline-variant">
              <div className="absolute -right-4 -top-4 size-24 rounded-full bg-surface-container-low opacity-50 transition-transform duration-500 group-hover:scale-110" />
              <div className="relative">
                <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Clientas activas</span>
                <div className="mt-2 flex items-end gap-3">
                  <span className="font-serif text-[40px] leading-[48px] tracking-[-0.02em] text-on-background">{data.activeClientas}</span>
                  <span className="mb-2 flex items-center text-sm text-surface-tint">
                    <Users className="mr-1 size-4" strokeWidth={1.8} />
                    total actual
                  </span>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-secondary-container bg-surface-container-lowest p-6 shadow-[0_4px_24px_rgba(112,30,52,0.03)] transition-colors hover:border-secondary-container/80">
              <div className="absolute left-0 top-0 h-1 w-full bg-secondary-container" />
              <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                <span className="size-2 rounded-full bg-secondary" />
                Requieren atención
              </span>
              <div className="mt-2 flex items-end gap-3">
                <span className="font-serif text-[40px] leading-[48px] tracking-[-0.02em] text-on-background">{data.weeklyAlerts}</span>
                <span className="mb-2 text-sm text-on-surface-variant">esta semana</span>
              </div>
            </div>

            <div className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-[0_4px_24px_rgba(112,30,52,0.03)] transition-colors hover:border-outline-variant">
              <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Bienestar general</span>
              <div className="mt-2 flex items-end gap-3">
                <span className="font-serif text-[40px] leading-[48px] tracking-[-0.02em] text-on-background">{data.wellbeingAverage}</span>
                {data.wellbeingAverage !== '-' && <span className="mb-2 text-sm text-on-surface-variant">/ 5.0</span>}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-stack-lg">
            <div className="flex items-end justify-between border-b border-outline-variant/30 pb-4">
              <h3 className="font-serif text-[32px] leading-[40px] tracking-[-0.01em] text-on-background">Próximas sesiones</h3>
              <Link href="/terapeuta/agenda" className="flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-container">
                Ver agenda completa
                <ArrowRight className="size-4" strokeWidth={1.9} />
              </Link>
            </div>

            {data.upcomingSessions.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {data.upcomingSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-on-surface-variant shadow-[0_4px_24px_rgba(112,30,52,0.03)]">
                No hay sesiones programadas próximamente.
              </div>
            )}
          </section>

          <section className="flex flex-col gap-stack-lg">
            <div className="flex items-end justify-between border-b border-outline-variant/30 pb-4">
              <h3 className="flex items-center gap-2 font-serif text-[32px] leading-[40px] tracking-[-0.01em] text-on-background">
                Requieren atención
                <AlertCircle className="size-6 text-surface-tint" strokeWidth={1.8} />
              </h3>
              <Link href="/terapeuta/clientas" className="hidden items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-container md:flex">
                Ver todas mis clientas
                <ArrowRight className="size-4" strokeWidth={1.9} />
              </Link>
            </div>

            {priorityClientas.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {priorityClientas.map((clienta) => (
                  <ClientaCard key={clienta.id} clienta={clienta} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-on-surface-variant shadow-[0_4px_24px_rgba(112,30,52,0.03)]">
                Todavía no hay clientas asignadas a tu perfil.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
