'use server'

import { createClient } from '@/lib/supabase/server'

type CheckinInsightRow = {
  fecha: string
  energia: number | null
  alerta_ansiedad: number | null
  sueno: 'mal' | 'medio' | 'bien' | null
  hubo_brote: boolean | null
  omitido: boolean | null
}

type NormalizedCheckinInsightRow = CheckinInsightRow & {
  registered: boolean
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function average(values: number[]) {
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function hasThreeInterruptedNights(checkins: NormalizedCheckinInsightRow[]) {
  let streak = 0

  for (const checkin of checkins) {
    if (checkin.registered && checkin.sueno === 'mal') {
      streak += 1
      if (streak >= 3) return true
    } else {
      streak = 0
    }
  }

  return false
}

function hasMoreStableEnergyThisWeek(checkins: NormalizedCheckinInsightRow[]) {
  const thisWeek = checkins.slice(-7)
  const previousWeek = checkins.slice(0, 7)

  const thisWeekAverage = average(
    thisWeek
      .filter((checkin) => checkin.registered && typeof checkin.energia === 'number')
      .map((checkin) => checkin.energia as number)
  )
  const previousWeekAverage = average(
    previousWeek
      .filter((checkin) => checkin.registered && typeof checkin.energia === 'number')
      .map((checkin) => checkin.energia as number)
  )

  return thisWeekAverage !== null && previousWeekAverage !== null && thisWeekAverage > previousWeekAverage
}

function hasFlareAfterHighActivation(checkins: NormalizedCheckinInsightRow[]) {
  const checkinsByDate = new Map(checkins.map((checkin) => [checkin.fecha, checkin]))

  return checkins.some((checkin) => {
    if (!checkin.registered || !checkin.hubo_brote) return false

    const previousDate = new Date(`${checkin.fecha}T12:00:00`)
    previousDate.setDate(previousDate.getDate() - 1)
    const previousCheckin = checkinsByDate.get(formatDateKey(previousDate))

    return Boolean(previousCheckin?.registered && (previousCheckin.alerta_ansiedad ?? 0) >= 4)
  })
}

export async function getInsights(): Promise<string[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')
  const userId = user.id

  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 13)
  const dates = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)
    return formatDateKey(date)
  })

  const { data: checkins } = await supabase
    .from('checkins')
    .select('fecha, energia, alerta_ansiedad, sueno, hubo_brote, omitido')
    .eq('usuario_id', userId)
    .gte('fecha', formatDateKey(startDate))
    .lte('fecha', formatDateKey(today))
    .order('fecha', { ascending: true })

  const checkinsByDate = new Map((checkins ?? []).map((checkin) => [checkin.fecha, checkin as CheckinInsightRow]))
  const rows = dates.map((fecha) => {
    const checkin = checkinsByDate.get(fecha)

    return {
      fecha,
      energia: checkin?.energia ?? null,
      alerta_ansiedad: checkin?.alerta_ansiedad ?? null,
      sueno: checkin?.sueno ?? null,
      hubo_brote: checkin?.hubo_brote ?? null,
      omitido: checkin?.omitido ?? null,
      registered: Boolean(checkin && !checkin.omitido),
    }
  })
  const insights: string[] = []

  if (hasThreeInterruptedNights(rows)) {
    insights.push('Tus días más difíciles suelen aparecer después de noches interrumpidas')
  }

  if (hasMoreStableEnergyThisWeek(rows)) {
    insights.push('Tu energía esta semana fue más estable que la anterior')
  }

  if (hasFlareAfterHighActivation(rows)) {
    insights.push('Tus brotes suelen aparecer después de días de mucha activación')
  }

  return insights.slice(0, 2)
}
