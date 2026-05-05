'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Circle } from 'lucide-react'

type ClientSort = 'prioridad' | 'reciente' | 'energia-baja'

type SortOption = {
  href: string
  label: string
  value: ClientSort
}

type SortDropdownProps = {
  activeSort: ClientSort
  options: SortOption[]
}

export function SortDropdown({ activeSort, options }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLabel = options.find((option) => option.value === activeSort)?.label ?? 'Ordenar'

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between rounded-full border border-outline-variant bg-surface-container-low py-0 pl-5 pr-10 text-sm text-on-surface outline-none transition-all hover:border-primary/30 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary-fixed"
      >
        <span>{activeLabel}</span>
        <ChevronDown className={`absolute right-4 top-1/2 size-5 -translate-y-1/2 text-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={1.9} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-full min-w-[240px] rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-[0_16px_36px_rgba(112,30,52,0.18)]"
        >
          {options.map((option) => {
            const isActive = activeSort === option.value

            return (
              <Link
                key={option.value}
                href={option.href}
                role="option"
                aria-selected={isActive}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-fixed text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                {isActive ? (
                  <Check className="size-[18px] text-primary" strokeWidth={2} />
                ) : (
                  <Circle className="size-[18px] text-outline" strokeWidth={1.7} />
                )}
                <span className="font-medium">{option.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
