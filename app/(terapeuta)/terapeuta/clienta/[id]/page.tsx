import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, CheckCircle, Zap } from 'lucide-react'
import { PhaseSelector } from '@/components/terapeuta/PhaseSelector'
import { TherapistSidebar } from '@/components/terapeuta/TherapistSidebar'
import { createClient } from '@/lib/supabase/server'

type AppRole = 'clienta' | 'terapeuta' | 'admin'

type ClientaRow = {
  id: string
  nombre: string
  email: string
  created_at: string
  terapeuta_asignada: string | null
  estado: string | null
}

type PerfilRow = {
  sintomas_principales: string | null
  tiempo_diagnostico: string | null
  fase_metodo: number | null
}

type CheckinRow = {
  fecha: string
  energia: number | null
  dolor: number | null
  sueno: 'mal' | 'medio' | 'bien' | null
  alerta_ansiedad: number | null
  hubo_brote: boolean | null
  nota_libre: string | null
}

type BroteRow = {
  id: string
  fecha: string
  hora: string | null
  intensidad: number | null
  posible_causa: string | null
  que_siente: string | null
  zona_corporal: string | null
  sigue_activo: boolean | null
}

type SesionRow = {
  id: string
  fecha_programada: string
  resumen_semanal: string | null
  preguntas_para_llevar: string | null
  created_at: string
}

type DaySummary = {
  fecha: string
  label: string
  energia: number | null
  dolor: number | null
  sueno: string | null
  alerta: number | null
  nota: string | null
  registered: boolean
}

type PhaseNumber = 1 | 2 | 3 | 4

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizePhase(value?: string, fallback?: number | null): PhaseNumber {
  const parsed = Number(value ?? fallback ?? 1)

  return parsed === 1 || parsed === 2 || parsed === 3 || parsed === 4 ? parsed : 1
}

function getPhaseDayRange(phase: PhaseNumber) {
  const start = ((phase - 1) * 21) + 1
  const end = phase * 21

  return { start, end }
}

function getPhaseDates(createdAt: string, phase: PhaseNumber) {
  const { start } = getPhaseDayRange(phase)
  const baseDate = new Date(createdAt)
  baseDate.setHours(12, 0, 0, 0)

  return Array.from({ length: 21 }, (_, index) => {
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() + start - 1 + index)
    return formatDateKey(date)
  })
}

function formatShortDate(fecha: string) {
  return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  })
}

function formatLongDate(value: string) {
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatSessionDate(value: string) {
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function average(values: Array<number | null>) {
  const validValues = values.filter((value): value is number => typeof value === 'number')
  if (validValues.length === 0) return null
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length
}

function sleepLabel(value: string | null) {
  if (value === 'mal') return 'Sueño malo'
  if (value === 'medio') return 'Sueño medio'
  if (value === 'bien') return 'Sueño bueno'
  return 'Sin sueño'
}

function splitSessionNotes(value: string | null) {
  if (!value?.trim()) return []
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

async function getClientaDetail(clientaId: string, requestedPhase?: string) {
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

  const { data: clienta } = await supabase
    .from('users')
    .select('id, nombre, email, created_at, terapeuta_asignada, estado')
    .eq('id', clientaId)
    .eq('rol', 'clienta')
    .single()

  if (!clienta) redirect('/terapeuta/clientas')
  if (role !== 'admin' && clienta.terapeuta_asignada !== user.id) redirect('/terapeuta/clientas')

  const [{ data: perfil }, { data: brotes }, { data: sesiones }] = await Promise.all([
    supabase
      .from('perfil_clinico_inicial')
      .select('sintomas_principales, tiempo_diagnostico, fase_metodo')
      .eq('usuario_id', clientaId)
      .maybeSingle(),
    supabase
      .from('brotes')
      .select('id, fecha, hora, intensidad, posible_causa, que_siente, zona_corporal, sigue_activo')
      .eq('usuario_id', clientaId)
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false })
      .limit(8),
    supabase
      .from('sesiones')
      .select('id, fecha_programada, resumen_semanal, preguntas_para_llevar, created_at')
      .eq('usuario_id', clientaId)
      .order('fecha_programada', { ascending: false })
      .limit(3),
  ])

  const selectedPhase = normalizePhase(requestedPhase, perfil?.fase_metodo)
  const dates = getPhaseDates(clienta.created_at, selectedPhase)

  const { data: checkins } = await supabase
    .from('checkins')
    .select('fecha, energia, dolor, sueno, alerta_ansiedad, hubo_brote, nota_libre')
    .eq('usuario_id', clientaId)
    .gte('fecha', dates[0])
    .lte('fecha', dates[dates.length - 1])
    .order('fecha', { ascending: true })

  const checkinsByDate = new Map((checkins ?? []).map((checkin) => [checkin.fecha, checkin as CheckinRow]))
  const days = dates.map((fecha): DaySummary => {
    const checkin = checkinsByDate.get(fecha)

    return {
      fecha,
      label: formatShortDate(fecha),
      energia: checkin?.energia ?? null,
      dolor: checkin?.dolor ?? null,
      sueno: checkin?.sueno ?? null,
      alerta: checkin?.alerta_ansiedad ?? null,
      nota: checkin?.nota_libre ?? null,
      registered: Boolean(checkin),
    }
  })

  return {
    therapistName: therapist.nombre,
    therapistAvatarUrl: therapist.avatar_url as string | null,
    clienta: clienta as ClientaRow,
    perfil: (perfil ?? null) as PerfilRow | null,
    selectedPhase,
    days,
    brotes: (brotes ?? []) as BroteRow[],
    sesiones: (sesiones ?? []) as SesionRow[],
  }
}

export default async function TherapistClientaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ fase?: string }>
}) {
  const { id } = await params
  const { fase } = await searchParams
  const { therapistName, therapistAvatarUrl, clienta, perfil, selectedPhase, days, brotes, sesiones } = await getClientaDetail(id, fase)
  const registeredDays = days.filter((day) => day.registered).length
  const averageEnergy = average(days.map((day) => day.energia))
  const averagePain = average(days.map((day) => day.dolor))
  const activeFlareups = brotes.filter((brote) => brote.sigue_activo).length
  const latestSession = sesiones[0]

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-on-surface antialiased">
      <TherapistSidebar therapistName={therapistName} therapistAvatarUrl={therapistAvatarUrl} activePath="/terapeuta/clientas" />

      <main className="min-h-screen p-container-padding-mobile md:ml-64 md:p-container-padding-desktop">
        <Link href="/terapeuta/clientas" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-70">
          <ArrowLeft className="size-[19px]" strokeWidth={1.9} />
          Volver a mis clientas
        </Link>

        <section className="mb-section-gap flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative">
            <div className="absolute -left-10 top-6 hidden h-px w-8 bg-primary opacity-30 md:block" />
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-outline">
              {clienta.estado === 'activo' ? 'Clienta activa' : 'Clienta inactiva'}
            </p>
            <h1 className="mb-4 font-serif text-[44px] leading-tight tracking-tight text-on-background">
              {clienta.nombre}
            </h1>
            <p className="max-w-xl text-[17px] leading-relaxed text-[#795541]">
              Ingreso: {formatLongDate(clienta.created_at)} · {perfil?.sintomas_principales || 'Sin condición registrada'}
            </p>
          </div>
          <PhaseSelector clientaId={clienta.id} selectedPhase={selectedPhase} />
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-surface-variant bg-surface-container-lowest p-5 shadow-[0px_4px_24px_rgba(142,53,74,0.03)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Registros</p>
            <p className="mt-2 font-serif text-3xl text-primary">{registeredDays}/21</p>
          </div>
          <div className="rounded-xl border border-surface-variant bg-surface-container-lowest p-5 shadow-[0px_4px_24px_rgba(142,53,74,0.03)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Energía media</p>
            <p className="mt-2 font-serif text-3xl text-primary">{averageEnergy ? averageEnergy.toFixed(1) : '-'}</p>
          </div>
          <div className="rounded-xl border border-surface-variant bg-surface-container-lowest p-5 shadow-[0px_4px_24px_rgba(142,53,74,0.03)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Dolor medio</p>
            <p className="mt-2 font-serif text-3xl text-primary">{averagePain ? averagePain.toFixed(1) : '-'}</p>
          </div>
          <div className="rounded-xl border border-surface-variant bg-surface-container-lowest p-5 shadow-[0px_4px_24px_rgba(142,53,74,0.03)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Brotes activos</p>
            <p className="mt-2 font-serif text-3xl text-primary">{activeFlareups}</p>
          </div>
        </section>

        <div className="grid grid-cols-12 gap-8">
          <section className="col-span-12 rounded-xl border-[0.5px] border-surface-variant bg-surface-container-lowest p-8 shadow-[0px_4px_24px_rgba(142,53,74,0.03)] lg:col-span-8">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h3 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-primary">
                Registro de Bienestar (21 días)
              </h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-secondary-container" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Energía</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-primary-container" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Dolor</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-[1040px] items-end justify-between gap-4">
                {days.map((day) => {
                  const energyHeight = `${Math.max((day.energia ?? 0) * 18, day.registered ? 12 : 6)}px`
                  const painHeight = `${Math.max((day.dolor ?? 0) * 18, day.registered ? 12 : 6)}px`

                  return (
                    <div key={day.fecha} className={`flex min-w-11 flex-col items-center ${day.registered ? '' : 'opacity-35'}`}>
                      <div className="flex h-32 items-end gap-1">
                        <div className="w-2 rounded-t-full bg-secondary-container transition-opacity" style={{ height: energyHeight }} />
                        <div className="w-2 rounded-t-full bg-primary-container/80 transition-opacity" style={{ height: painHeight }} />
                      </div>
                      <div className="mt-4 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-outline">{day.label}</p>
                        <p className="mt-1 text-[10px] text-on-surface-variant">{day.registered ? sleepLabel(day.sueno) : 'Sin registro'}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 border-t border-outline-variant/40 pt-6 md:grid-cols-2">
              {days.filter((day) => day.registered).slice(-4).map((day) => (
                <div key={day.fecha} className="rounded-lg bg-surface-container-low p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">{day.label}</p>
                    <p className="text-[12px] text-on-surface-variant">Alerta {day.alerta ?? '-'}/5</p>
                  </div>
                  <p className="mt-2 text-sm text-on-surface">
                    Energía {day.energia ?? '-'} · Dolor {day.dolor ?? '-'} · {sleepLabel(day.sueno)}
                  </p>
                  {day.nota && <p className="mt-2 text-sm italic text-on-surface-variant">&quot;{day.nota}&quot;</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="col-span-12 rounded-xl border-[0.5px] border-surface-variant bg-surface-container-low p-8 lg:col-span-4">
            <h3 className="mb-8 font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-primary">Brotes Recientes</h3>
            {brotes.length > 0 ? (
              <div className="space-y-6">
                {brotes.map((brote, index) => (
                  <div key={brote.id} className={`flex items-start gap-4 ${index < brotes.length - 1 ? 'border-b border-outline-variant/30 pb-6' : ''}`}>
                    <div className="rounded-lg bg-primary-container/10 p-2">
                      <Zap className="size-5 text-primary-container" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
                        {formatShortDate(brote.fecha)} · Intensidad {brote.intensidad ?? '-'}/5
                      </p>
                      <p className="font-medium text-on-surface">{brote.posible_causa || 'Sin causa identificada'}</p>
                      <p className="mt-1 text-sm italic text-outline">
                        &quot;{brote.que_siente || brote.zona_corporal || 'Sin descripción adicional.'}&quot;
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-surface-container-lowest p-4 text-sm text-on-surface-variant">No hay brotes registrados todavía.</p>
            )}
          </section>

          <section className="col-span-12 rounded-xl border-[0.5px] border-surface-variant bg-surface-container-lowest p-8 shadow-[0px_4px_24px_rgba(142,53,74,0.03)] md:p-12">
            <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-baseline md:gap-4">
              <h3 className="font-serif text-[32px] leading-[40px] tracking-[-0.01em] text-primary">Preparación para la Próxima Sesión</h3>
              {latestSession && (
                <span className="text-sm text-outline">Preparado el {formatSessionDate(latestSession.created_at)}</span>
              )}
            </div>

            {sesiones.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="space-y-5">
                  <h4 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-secondary">Notas preparadas por la clienta</h4>
                  {splitSessionNotes(latestSession?.preguntas_para_llevar ?? null).length > 0 ? (
                    <ul className="space-y-4">
                      {splitSessionNotes(latestSession?.preguntas_para_llevar ?? null).map((note) => (
                        <li key={note} className="flex items-start gap-3">
                          <CheckCircle className="mt-0.5 size-[18px] text-primary" strokeWidth={1.8} />
                          <p className="text-[16px] leading-[24px] text-on-surface">{note}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-lg bg-surface-container-low p-4 text-sm text-on-surface-variant">La clienta no dejó preguntas para llevar todavía.</p>
                  )}
                </div>

                <div className="relative overflow-hidden rounded-xl border-[0.5px] border-surface-variant bg-surface-container-low p-8">
                  <h4 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-secondary">Resumen semanal</h4>
                  <p className="whitespace-pre-wrap font-serif text-lg italic leading-relaxed text-on-surface">
                    {latestSession?.resumen_semanal || 'Todavía no hay resumen semanal guardado para esta sesión.'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="rounded-lg bg-surface-container-low p-4 text-sm text-on-surface-variant">No hay preparación de sesión registrada todavía.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
