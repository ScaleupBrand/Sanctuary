'use server'

import { createClient } from '@/lib/supabase/server'

async function getUserId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

export type HistoryThread = {
  id: string
  type: 'checkin' | 'brote'
  title: string
  date: string
  content: string
  colorClass: string
}

export type WeeklyChartPoint = {
  fecha: string
  dayLabel: string
  dateLabel: string
  energia: number | null
  dolor: number | null
  huboBrote: boolean
  registered: boolean
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export async function getWeeklyChartData(): Promise<WeeklyChartPoint[]> {
  const supabase = await createClient()
  const userId = await getUserId()

  const today = new Date()
  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    return formatDateKey(date)
  })

  const { data: checkins } = await supabase
    .from('checkins')
    .select('fecha, energia, dolor, hubo_brote, omitido')
    .eq('usuario_id', userId)
    .in('fecha', dates)
    .order('fecha', { ascending: true })

  return dates.map((fecha) => {
    const date = new Date(`${fecha}T12:00:00`)
    const checkin = checkins?.find((item) => item.fecha === fecha)
    const registered = Boolean(checkin && !checkin.omitido)

    return {
      fecha,
      dayLabel: date.toLocaleDateString('es-ES', { weekday: 'short' }),
      dateLabel: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      energia: registered ? checkin?.energia ?? null : null,
      dolor: registered ? checkin?.dolor ?? null : null,
      huboBrote: registered ? checkin?.hubo_brote ?? false : false,
      registered,
    }
  })
}

export async function getRecentThreads(): Promise<HistoryThread[]> {
  const supabase = await createClient()
  const userId = await getUserId()

  // Fetch checkins with notes
  const { data: checkins } = await supabase
    .from('checkins')
    .select('id, fecha, created_at, nota_libre, energia')
    .eq('usuario_id', userId)
    .not('nota_libre', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch brotes
  const { data: brotes } = await supabase
    .from('brotes')
    .select('id, fecha, created_at, zona_corporal, que_hizo_para_regularse, intensidad')
    .eq('usuario_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  const threads: HistoryThread[] = []

  if (checkins) {
    checkins.forEach((c) => {
      if (c.nota_libre && c.nota_libre.trim() !== '') {
        threads.push({
          id: `checkin-${c.id}`,
          type: 'checkin',
          title: 'Registro diario',
          date: c.created_at,
          content: c.nota_libre,
          colorClass: 'bg-primary-container border-primary-container',
        })
      }
    })
  }

  if (brotes) {
    brotes.forEach((b) => {
      const content = b.que_hizo_para_regularse || b.zona_corporal || 'Brote registrado'
      threads.push({
        id: `brote-${b.id}`,
        type: 'brote',
        title: 'Brote registrado',
        date: b.created_at,
        content: content,
        colorClass: 'bg-tertiary-container border-tertiary-container',
      })
    })
  }

  // Sort combined threads descending by date
  threads.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return threads.slice(0, 10)
}
