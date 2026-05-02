'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
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
  day: string
  fecha: string
  energia: number
  omitido: boolean
  registered: boolean
}

interface CheckinContextType {
  isPending: boolean
  clinicalDate: string | null
  todayCheckin: CheckinData | null
  weeklyHistory: WeeklyDay[]
  requestNavigation: (href: string) => void
  setPending: (val: boolean) => void
  setTodayCheckin: (data: CheckinData | null) => void
}

interface CheckinProviderProps {
  children: React.ReactNode
  initialIsPending: boolean
  initialClinicalDate: string | null
  initialTodayCheckin: CheckinData | null
  initialWeeklyHistory: WeeklyDay[]
}

const CheckinContext = createContext<CheckinContextType | undefined>(undefined)

export function CheckinProvider({ children, initialIsPending, initialClinicalDate, initialTodayCheckin, initialWeeklyHistory }: CheckinProviderProps) {
  const router = useRouter()

  const [isPending, setIsPending] = useState<boolean>(initialIsPending)
  const [clinicalDate] = useState<string | null>(initialClinicalDate)
  const [todayCheckin, setTodayCheckin] = useState<CheckinData | null>(initialTodayCheckin)
  const [weeklyHistory] = useState<WeeklyDay[]>(initialWeeklyHistory)

  const [modalOpen, setModalOpen] = useState(false)
  const [targetHref, setTargetHref] = useState<string | null>(null)
  const [isSkipping, setIsSkipping] = useState(false)

  // Sync if server re-renders with new value
  useEffect(() => {
    setIsPending(initialIsPending)
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
    const res = await skipCheckin(clinicalDate)
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
      requestNavigation, setPending: setIsPending, setTodayCheckin,
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
