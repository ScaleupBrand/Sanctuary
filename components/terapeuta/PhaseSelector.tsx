'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'

type PhaseNumber = 1 | 2 | 3 | 4

const phases: PhaseNumber[] = [1, 2, 3, 4]

export function PhaseSelector({
  clientaId,
  selectedPhase,
}: {
  clientaId: string
  selectedPhase: PhaseNumber
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const otherPhases = phases.filter((phase) => phase !== selectedPhase)

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative rounded-xl border border-outline-variant bg-surface-container-lowest px-5 py-4 shadow-[0px_4px_24px_rgba(142,53,74,0.03)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Fase del método</p>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="mt-1 flex min-w-[180px] items-center justify-between gap-4 rounded-lg py-1 text-left font-serif text-2xl text-primary transition-opacity hover:opacity-80"
      >
        <span>Fase {selectedPhase}</span>
        <ChevronDown className={`size-[22px] transition-transform ${isOpen ? 'rotate-180' : ''}`} strokeWidth={1.9} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-[0_18px_42px_rgba(112,30,52,0.16)]">
          {otherPhases.map((phase) => (
            <Link
              key={phase}
              href={`/terapeuta/clienta/${clientaId}?fase=${phase}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
            >
              <span>Fase {phase}</span>
              <ArrowRight className="size-[18px] text-outline" strokeWidth={1.9} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
