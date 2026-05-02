'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '@/lib/actions/onboarding'

export default function TuHorarioClient() {
  const [hour, setHour] = useState(8)
  const [minute, setMinute] = useState(30)
  const [isAM, setIsAM] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const router = useRouter()

  const handleIncreaseHour = () => setHour((h) => (h === 12 ? 1 : h + 1))
  const handleDecreaseHour = () => setHour((h) => (h === 1 ? 12 : h - 1))
  
  const handleIncreaseMinute = () => setMinute((m) => (m >= 55 ? 0 : m + 5))
  const handleDecreaseMinute = () => setMinute((m) => (m <= 0 ? 55 : m - 5))

  const handleComplete = async () => {
    setIsSaving(true)
    let h24 = hour
    if (isAM && hour === 12) h24 = 0
    if (!isAM && hour !== 12) h24 = hour + 12
    const timeString = `${h24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    
    await completeOnboarding(timeString)
    router.push('/inicio')
  }

  // Handle skip by using default 20:00 (which is what we set in db migration)
  const handleSkip = async () => {
    setIsSaving(true)
    await completeOnboarding('20:00')
    router.push('/inicio')
  }

  return (
    <>
      {/* TopAppBar */}
      <header className="bg-[#FAF7F2] dark:bg-stone-950 docked full-width top-0 border-b-[0.5px] border-rose-100 dark:border-stone-800 flat no shadows fixed left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-opacity-90 backdrop-blur-md">
        <Link href="/onboarding/tu-nombre" aria-label="Go back" className="hover:opacity-70 transition-opacity duration-300 active:scale-95 flex items-center focus:outline-none">
          <span className="material-symbols-outlined text-[#8E354A] dark:text-rose-400" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
        </Link>
        <span className="font-serif text-[#8E354A] dark:text-rose-200 antialiased font-medium">
          4 of 4
        </span>
        <button 
          onClick={handleSkip}
          disabled={isSaving}
          className="text-[#8E354A] dark:text-rose-300 hover:opacity-70 transition-opacity duration-300 active:scale-95 font-serif font-medium focus:outline-none disabled:opacity-50"
        >
          Skip
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col items-center px-container-padding-mobile pt-[120px] pb-[140px] w-full max-w-lg mx-auto min-h-screen">
        {/* Header Text */}
        <div className="w-full text-left">
          <h1 className="font-h1-serif text-h1-serif text-on-background">Tu hora de encuentro</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-stack-sm max-w-[320px]">
            Elegí un momento del día para realizar tu registro y conectar con vos misma.
          </p>
        </div>

        {/* Refined Time Picker Area */}
        <div className="mt-section-gap flex flex-col items-center w-full justify-center flex-grow">
          <div className="relative flex items-center justify-center p-8 bg-surface-container-lowest rounded-xl border-[0.5px] border-outline-variant shadow-[0_16px_40px_rgba(112,30,52,0.03)] w-full max-w-[340px]">
            {/* Time Selection */}
            <div className="flex items-center space-x-6">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <button onClick={handleIncreaseHour} aria-label="Increase hour" className="material-symbols-outlined text-outline hover:text-primary transition-colors focus:outline-none p-2 active:bg-surface-variant rounded-full">keyboard_arrow_up</button>
                <div className="font-display-serif text-display-serif text-on-background py-stack-sm w-16 text-center select-none">
                  {hour.toString().padStart(2, '0')}
                </div>
                <button onClick={handleDecreaseHour} aria-label="Decrease hour" className="material-symbols-outlined text-outline hover:text-primary transition-colors focus:outline-none p-2 active:bg-surface-variant rounded-full">keyboard_arrow_down</button>
              </div>

              {/* Separator */}
              <div className="font-display-serif text-display-serif text-outline-variant pb-stack-lg select-none">:</div>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <button onClick={handleIncreaseMinute} aria-label="Increase minute" className="material-symbols-outlined text-outline hover:text-primary transition-colors focus:outline-none p-2 active:bg-surface-variant rounded-full">keyboard_arrow_up</button>
                <div className="font-display-serif text-display-serif text-on-background py-stack-sm w-16 text-center select-none">
                  {minute.toString().padStart(2, '0')}
                </div>
                <button onClick={handleDecreaseMinute} aria-label="Decrease minute" className="material-symbols-outlined text-outline hover:text-primary transition-colors focus:outline-none p-2 active:bg-surface-variant rounded-full">keyboard_arrow_down</button>
              </div>
            </div>

            {/* AM / PM Toggle */}
            <div className="absolute right-[-24px] flex flex-col space-y-stack-sm bg-surface-container-lowest p-2 rounded-full border-[0.5px] border-outline-variant shadow-[0_8px_24px_rgba(112,30,52,0.04)]">
              <button 
                onClick={() => setIsAM(true)}
                className={`${isAM ? 'bg-primary text-on-primary shadow-sm' : 'bg-transparent text-on-surface-variant hover:bg-surface-variant'} font-label-caps text-label-caps w-10 h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none`}
              >
                AM
              </button>
              <button 
                onClick={() => setIsAM(false)}
                className={`${!isAM ? 'bg-primary text-on-primary shadow-sm' : 'bg-transparent text-on-surface-variant hover:bg-surface-variant'} font-label-caps text-label-caps w-10 h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Soft Helper/Context Text */}
          <div className="mt-stack-lg flex items-center space-x-3 text-on-surface-variant opacity-80">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>notifications_active</span>
            <span className="font-body-md text-body-md text-[14px]">Programaremos un recordatorio suave a esta hora.</span>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action Area */}
      <div className="fixed bottom-0 left-0 w-full px-container-padding-mobile pb-8 pt-12 bg-gradient-to-t from-background via-background to-transparent flex justify-center z-40 pointer-events-none">
        <div className="w-full max-w-lg pointer-events-auto">
          <button 
            onClick={handleComplete}
            disabled={isSaving}
            className="w-full bg-primary text-on-primary font-button-text text-button-text py-4 rounded-xl shadow-[0_12px_24px_rgba(112,30,52,0.06)] hover:bg-[#852540] active:scale-[0.98] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-fixed focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                Guardando...
              </>
            ) : (
              'Empezar mi camino'
            )}
          </button>
        </div>
      </div>
    </>
  )
}
