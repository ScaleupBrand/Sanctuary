import { redirect } from 'next/navigation'
import { cancelScheduledSession } from '@/lib/actions/agenda'
import { createClient } from '@/lib/supabase/server'
import { AgendaScheduler } from '@/components/terapeuta/AgendaScheduler'
import { TherapistSidebar } from '@/components/terapeuta/TherapistSidebar'

type AppRole = 'clienta' | 'terapeuta' | 'admin'

type ClientaOption = {
  id: string
  nombre: string
  email: string
}

type SessionRow = {
  id: string
  terapeuta_id: string
  clienta_id: string
  fecha_hora: string
  notas_previas: string | null
  estado: 'programada' | 'completada' | 'cancelada'
}

function formatSessionDate(value: string) {
  return new Date(value).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function getAgendaData() {
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

  const clientasQuery = supabase
    .from('users')
    .select('id, nombre, email')
    .eq('rol', 'clienta')
    .eq('estado', 'activo')
    .order('nombre', { ascending: true })

  const { data: clientas } = role === 'admin'
    ? await clientasQuery
    : await clientasQuery.eq('terapeuta_asignada', user.id)

  const sessionsQuery = supabase
    .from('sesiones_agendadas')
    .select('id, terapeuta_id, clienta_id, fecha_hora, notas_previas, estado')
    .eq('estado', 'programada')
    .gte('fecha_hora', new Date().toISOString())
    .order('fecha_hora', { ascending: true })

  const { data: sessions } = role === 'admin'
    ? await sessionsQuery
    : await sessionsQuery.eq('terapeuta_id', user.id)

  const clientasMap = new Map((clientas ?? []).map((clienta) => [clienta.id, clienta as ClientaOption]))

  return {
    therapistName: therapist.nombre,
    therapistAvatarUrl: therapist.avatar_url as string | null,
    clientas: (clientas ?? []) as ClientaOption[],
    sessions: ((sessions ?? []) as SessionRow[]).map((session) => ({
      ...session,
      clienta: clientasMap.get(session.clienta_id) ?? null,
    })),
  }
}

export default async function TherapistAgendaPage() {
  const { therapistName, therapistAvatarUrl, clientas, sessions } = await getAgendaData()

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-on-surface antialiased">
      <TherapistSidebar therapistName={therapistName} therapistAvatarUrl={therapistAvatarUrl} activePath="/terapeuta/agenda" />

      <main className="min-h-screen p-container-padding-mobile md:ml-64 md:p-container-padding-desktop">
        <header className="relative mb-16">
          <div className="absolute -left-10 top-6 hidden h-px w-8 bg-primary opacity-30 md:block" />
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-outline">Agenda</p>
          <h1 className="mb-4 font-serif text-[44px] leading-tight tracking-tight text-on-background">
            Agenda de<br />
            <span className="italic text-primary">Sesiones</span>
          </h1>
          <p className="max-w-xl text-[17px] leading-relaxed text-[#795541]">Organizá las próximas sesiones y dejá contexto previo para llegar con más claridad.</p>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[420px_1fr]">
          <AgendaScheduler clientas={clientas} />

          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[0px_4px_24px_rgba(142,53,74,0.03)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-primary">Sesiones programadas</h2>
                <p className="mt-1 text-sm text-on-surface-variant">{sessions.length} próximas sesiones</p>
              </div>
            </div>

            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <article key={session.id} className="rounded-lg border border-outline-variant/50 bg-surface-container-low p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">{formatSessionDate(session.fecha_hora)}</p>
                        <h3 className="mt-1 font-serif text-xl text-on-surface">{session.clienta?.nombre ?? 'Clienta no disponible'}</h3>
                        {session.clienta?.email && <p className="text-sm text-on-surface-variant">{session.clienta.email}</p>}
                        {session.notas_previas && (
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">{session.notas_previas}</p>
                        )}
                      </div>

                      <form action={cancelScheduledSession}>
                        <input type="hidden" name="id" value={session.id} />
                        <button className="rounded-full border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:border-primary/40 hover:text-primary">
                          Cancelar
                        </button>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-surface-container-low p-4 text-sm text-on-surface-variant">No hay sesiones programadas.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
