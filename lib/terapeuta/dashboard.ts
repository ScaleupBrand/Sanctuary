import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ClientFilter = 'todas' | 'atencion' | 'brotes' | 'energia-baja' | 'notas-recientes' | 'sin-registros'
export type ClientSort = 'prioridad' | 'reciente' | 'energia-baja'
type AppRole = 'clienta' | 'terapeuta' | 'admin'

type ClientaRow = {
  id: string
  nombre: string
  email: string
  created_at: string
  estado: string | null
}

type CheckinRow = {
  usuario_id: string
  fecha: string
  energia: number | null
  dolor: number | null
  hubo_brote: boolean | null
  nota_libre: string | null
  created_at: string
}

export type HerramientaRow = {
  id: string
  nombre: string
  tipo: string | null
  categoria: string | null
  duracion: number | null
  fase_metodo: number | null
  archivo_url: string | null
  contenido: string | null
  activa: boolean | null
}

export type SupervisionNoteRow = {
  id: string
  contenido: string
  created_at: string
}

export type ClientaSummary = {
  id: string
  nombre: string
  email: string
  estado: string | null
  initials: string
  lastCheckinLabel: string
  lastCheckinTimestamp: number
  averageEnergy: string
  averageEnergyValue: number | null
  flareCount: number
  registeredDays: number
  latestNote: string | null
  needsAttention: boolean
}

export type UpcomingTherapistSession = {
  id: string
  clientaId: string
  clientaNombre: string
  clientaEmail: string
  clientaInitials: string
  fechaHora: string
  notasPrevias: string | null
}

export const clientFilterLabels: Record<ClientFilter, string> = {
  todas: 'Todas',
  atencion: 'Requieren atención',
  brotes: 'Con brotes',
  'energia-baja': 'Energía baja',
  'notas-recientes': 'Con notas recientes',
  'sin-registros': 'Sin registros',
}

export const clientSortLabels: Record<ClientSort, string> = {
  prioridad: 'Prioridad clínica',
  reciente: 'Registro reciente',
  'energia-baja': 'Energía más baja',
}

export function normalizeFilter(value?: string): ClientFilter {
  const filters: ClientFilter[] = ['todas', 'atencion', 'brotes', 'energia-baja', 'notas-recientes', 'sin-registros']
  return filters.includes(value as ClientFilter) ? (value as ClientFilter) : 'todas'
}

export function normalizeSort(value?: string): ClientSort {
  const sorts: ClientSort[] = ['prioridad', 'reciente', 'energia-baja']
  return sorts.includes(value as ClientSort) ? (value as ClientSort) : 'prioridad'
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? ''
  return `${first}${second}`.toUpperCase() || 'ST'
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getLastSevenDates() {
  const today = new Date()

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    return formatDateKey(date)
  })
}

function formatLastCheckin(checkin?: CheckinRow) {
  if (!checkin) return 'Sin registros recientes'

  const date = new Date(checkin.created_at)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return `Ayer, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
  }

  const diffMs = today.getTime() - date.getTime()
  const diffDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)))

  if (diffDays <= 7) return `Hace ${diffDays} días`

  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function hasThreeMissedDays(dates: string[], checkins: CheckinRow[]) {
  const registeredDates = new Set(checkins.map((checkin) => checkin.fecha))
  let streak = 0

  for (const date of dates) {
    if (registeredDates.has(date)) {
      streak = 0
    } else {
      streak += 1
      if (streak >= 3) return true
    }
  }

  return false
}

function buildClientaSummary(clienta: ClientaRow, checkins: CheckinRow[], dates: string[]): ClientaSummary {
  const sortedCheckins = [...checkins].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const energyValues = checkins
    .filter((checkin) => typeof checkin.energia === 'number')
    .map((checkin) => checkin.energia as number)
  const averageEnergyValue = energyValues.length > 0
    ? energyValues.reduce((sum, value) => sum + value, 0) / energyValues.length
    : null
  const averageEnergy = averageEnergyValue !== null ? averageEnergyValue.toFixed(1) : '-'
  const lastCheckin = sortedCheckins[0]
  const latestNote = sortedCheckins.find((checkin) => checkin.nota_libre?.trim())?.nota_libre?.trim() ?? null

  return {
    id: clienta.id,
    nombre: clienta.nombre,
    email: clienta.email,
    estado: clienta.estado,
    initials: getInitials(clienta.nombre),
    lastCheckinLabel: formatLastCheckin(lastCheckin),
    lastCheckinTimestamp: lastCheckin ? new Date(lastCheckin.created_at).getTime() : 0,
    averageEnergy,
    averageEnergyValue,
    flareCount: checkins.filter((checkin) => checkin.hubo_brote).length,
    registeredDays: new Set(checkins.map((checkin) => checkin.fecha)).size,
    latestNote,
    needsAttention: hasThreeMissedDays(dates, checkins),
  }
}

export function matchesFilter(clienta: ClientaSummary, filter: ClientFilter) {
  if (filter === 'atencion') return clienta.needsAttention
  if (filter === 'brotes') return clienta.flareCount > 0
  if (filter === 'energia-baja') return clienta.averageEnergyValue !== null && clienta.averageEnergyValue <= 2.5
  if (filter === 'notas-recientes') return Boolean(clienta.latestNote)
  if (filter === 'sin-registros') return clienta.registeredDays === 0
  return true
}

export function sortClientas(clientas: ClientaSummary[], sort: ClientSort) {
  return [...clientas].sort((a, b) => {
    if (sort === 'reciente') return b.lastCheckinTimestamp - a.lastCheckinTimestamp

    if (sort === 'energia-baja') {
      const aEnergy = a.averageEnergyValue ?? Number.POSITIVE_INFINITY
      const bEnergy = b.averageEnergyValue ?? Number.POSITIVE_INFINITY
      return aEnergy - bEnergy
    }

    if (a.needsAttention !== b.needsAttention) return a.needsAttention ? -1 : 1
    if (a.registeredDays !== b.registeredDays) return a.registeredDays - b.registeredDays
    return b.flareCount - a.flareCount
  })
}

function calculateWellbeing(checkins: CheckinRow[]) {
  const values = checkins
    .filter((checkin) => typeof checkin.energia === 'number' || typeof checkin.dolor === 'number')
    .map((checkin) => {
      const energy = checkin.energia ?? 3
      const painRelief = typeof checkin.dolor === 'number' ? 6 - checkin.dolor : 3
      return (energy + painRelief) / 2
    })

  if (values.length === 0) return '-'
  return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)
}

export async function getTherapistDashboardData({
  searchTerm = '',
  filter = 'todas',
  sort = 'prioridad',
}: {
  searchTerm?: string
  filter?: ClientFilter
  sort?: ClientSort
}) {
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
    .select('id, nombre, email, created_at, estado')
    .eq('rol', 'clienta')
    .order('nombre', { ascending: true })

  const { data: clientas } = role === 'admin'
    ? await clientasQuery
    : await clientasQuery.eq('terapeuta_asignada', user.id)

  const dates = getLastSevenDates()
  const clientaIds = (clientas ?? []).map((clienta) => clienta.id)

  const { data: checkins } = clientaIds.length > 0
    ? await supabase
        .from('checkins')
        .select('usuario_id, fecha, energia, dolor, hubo_brote, nota_libre, created_at')
        .in('usuario_id', clientaIds)
        .gte('fecha', dates[0])
        .lte('fecha', dates[dates.length - 1])
        .order('created_at', { ascending: false })
    : { data: [] }

  const sessionsQuery = supabase
    .from('sesiones_agendadas')
    .select('id, clienta_id, fecha_hora, notas_previas')
    .eq('estado', 'programada')
    .gte('fecha_hora', new Date().toISOString())
    .order('fecha_hora', { ascending: true })
    .limit(3)

  const { data: upcomingSessions } = role === 'admin'
    ? await sessionsQuery
    : await sessionsQuery.eq('terapeuta_id', user.id)

  const checkinsByClienta = new Map<string, CheckinRow[]>()

  for (const checkin of (checkins ?? []) as CheckinRow[]) {
    const current = checkinsByClienta.get(checkin.usuario_id) ?? []
    current.push(checkin)
    checkinsByClienta.set(checkin.usuario_id, current)
  }

  const summaries = ((clientas ?? []) as ClientaRow[]).map((clienta) =>
    buildClientaSummary(clienta, checkinsByClienta.get(clienta.id) ?? [], dates)
  )
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const searchedSummaries = normalizedSearch
    ? summaries.filter((clienta) =>
        `${clienta.nombre} ${clienta.email}`.toLowerCase().includes(normalizedSearch)
      )
    : summaries
  const filteredClientas = sortClientas(
    searchedSummaries.filter((clienta) => matchesFilter(clienta, filter)),
    sort
  )
  const priorityClientas = sortClientas(summaries, 'prioridad')
  const clientasById = new Map(summaries.map((clienta) => [clienta.id, clienta]))
  const filterCounts: Record<ClientFilter, number> = {
    todas: searchedSummaries.length,
    atencion: searchedSummaries.filter((clienta) => matchesFilter(clienta, 'atencion')).length,
    brotes: searchedSummaries.filter((clienta) => matchesFilter(clienta, 'brotes')).length,
    'energia-baja': searchedSummaries.filter((clienta) => matchesFilter(clienta, 'energia-baja')).length,
    'notas-recientes': searchedSummaries.filter((clienta) => matchesFilter(clienta, 'notas-recientes')).length,
    'sin-registros': searchedSummaries.filter((clienta) => matchesFilter(clienta, 'sin-registros')).length,
  }

  return {
    therapistName: therapist.nombre,
    therapistAvatarUrl: therapist.avatar_url as string | null,
    clientas: filteredClientas,
    priorityClientas,
    totalClientas: summaries.length,
    activeClientas: summaries.filter((clienta) => clienta.estado === 'activo').length,
    weeklyAlerts: summaries.filter((clienta) => clienta.needsAttention).length,
    wellbeingAverage: calculateWellbeing((checkins ?? []) as CheckinRow[]),
    upcomingSessions: ((upcomingSessions ?? []) as Array<{
      id: string
      clienta_id: string
      fecha_hora: string
      notas_previas: string | null
    }>).map((session) => {
      const clienta = clientasById.get(session.clienta_id)

      return {
        id: session.id,
        clientaId: session.clienta_id,
        clientaNombre: clienta?.nombre ?? 'Clienta no disponible',
        clientaEmail: clienta?.email ?? '',
        clientaInitials: clienta?.initials ?? 'ST',
        fechaHora: session.fecha_hora,
        notasPrevias: session.notas_previas,
      }
    }),
    searchTerm,
    activeFilter: filter,
    activeSort: sort,
    filterCounts,
  }
}

export async function getTherapistToolsAndNotes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: herramientas }, { data: supervisionNotes }] = await Promise.all([
    supabase
      .from('herramientas')
      .select('id, nombre, tipo, categoria, duracion, fase_metodo, archivo_url, contenido, activa')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('notas_supervision')
      .select('id, contenido, created_at')
      .eq('terapeuta_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  return {
    herramientas: (herramientas ?? []) as HerramientaRow[],
    supervisionNotes: ((supervisionNotes ?? []) as SupervisionNoteRow[]).reverse(),
  }
}
