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
        // Determine title and color based on energy or just generic
        const isGood = c.energia && c.energia >= 4
        threads.push({
          id: `checkin-${c.id}`,
          type: 'checkin',
          title: isGood ? 'Quiet Clarity' : 'Daily Check-in',
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
        title: 'Physical Release',
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
