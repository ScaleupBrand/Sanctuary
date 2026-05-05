'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NavigationModal } from '@/components/ui/NavigationModal'
import { skipCheckin } from '@/lib/actions/checkin-status'

export interface CheckinData {
  id?: string
  energia?: number | null
  dolor?: number | null
  alerta_ansiedad?: number | null
  sueno?: string | null
  hubo_brote?: boolean
  nota_libre?: string | null
  omitido?: boolean
}

export interface WeeklyDay {
  fecha: string
  dayLabel: string
  dateLabel: string
  energia: number | null
  dolor: number | null
  huboBrote: boolean
  registered: boolean
}

export interface UpcomingSession {
  id: string
  fecha_hora: string
  notas_previas?: string | null
  estado?: string | null
}

interface CheckinContextType {
  isPending: boolean
  clinicalDate: string | null
  todayCheckin: CheckinData | null
  weeklyHistory: WeeklyDay[]
  userName: string | null
  upcomingSession: UpcomingSession | null
  requestNavigation: (href: string) => void
  setPending: (val: boolean) => void
  setTodayCheckin: (data: CheckinData | null) => void
  setWeeklyHistory: (data: WeeklyDay[] | ((current: WeeklyDay[]) => WeeklyDay[])) => void
}

interface CheckinProviderProps {
  children: React.ReactNode
  initialIsPending: boolean
  initialClinicalDate: string | null
  initialTodayCheckin: CheckinData | null
  initialWeeklyHistory: WeeklyDay[]
  initialUserName: string | null
  initialUpcomingSession: UpcomingSession | null
}

const CheckinContext = createContext<CheckinContextType | undefined>(undefined)

export function CheckinProvider({ children, initialIsPending, initialClinicalDate, initialTodayCheckin, initialWeeklyHistory, initialUserName, initialUpcomingSession }: CheckinProviderProps) {
  const router = useRouter()

  const [isPending, setIsPending] = useState<boolean>(initialIsPending)
  const [clinicalDate] = useState<string | null>(initialClinicalDate)
  const [todayCheckin, setTodayCheckin] = useState<CheckinData | null>(initialTodayCheckin)
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyDay[]>(initialWeeklyHistory)

  const [modalOpen, setModalOpen] = useState(false)
  const [targetHref, setTargetHref] = useState<string | null>(null)
  const [isSkipping, setIsSkipping] = useState(false)

  // Sync if server re-renders with new value
  useEffect(() => {
    let cancelled = false

    queueMicrotask(() => {
      if (!cancelled) setIsPending(initialIsPending)
    })

    return () => {
      cancelled = true
    }
  }, [initialIsPending])

  const requestNavigation = (href: string) => {
    if (isPending) {
      setTargetHref(href)
      setModalOpen(true)
    } else {
      router.push(href)
    }
  }

  const handleSkip = async () => {
    if (!clinicalDate) {
      setModalOpen(false)
      setIsPending(false)
      if (targetHref) router.push(targetHref)
      return
    }
    setIsSkipping(true)
    const res = await skipCheckin()
    if (res.success || res.error) {
      setIsPending(false)
      setModalOpen(false)
      if (targetHref) router.push(targetHref)
    }
    setIsSkipping(false)
  }

  return (
    <CheckinContext.Provider value={{
      isPending, clinicalDate, todayCheckin, weeklyHistory,
      userName: initialUserName,
      upcomingSession: initialUpcomingSession,
      requestNavigation, setPending: setIsPending, setTodayCheckin, setWeeklyHistory,
    }}>
      {children}
      <NavigationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSkip={handleSkip}
        isSkipping={isSkipping}
      />
    </CheckinContext.Provider>
  )
}

export function useCheckin() {
  const context = useContext(CheckinContext)
  if (context === undefined) {
    throw new Error('useCheckin must be used within a CheckinProvider')
  }
  return context
}
