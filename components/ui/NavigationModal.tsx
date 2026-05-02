'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface NavigationModalProps {
  isOpen: boolean
  onClose: () => void
  onSkip: () => void
  isSkipping: boolean
}

export function NavigationModal({ isOpen, onClose, onSkip, isSkipping }: NavigationModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  const modalContent = (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      className="flex items-center justify-center p-6"
    >
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(34,25,26,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal card */}
      <div
        style={{ position: 'relative', zIndex: 10000, width: '100%', maxWidth: '360px' }}
        className="bg-[#FAF9F6] dark:bg-stone-950 rounded-3xl p-8 shadow-2xl border border-rose-100 dark:border-stone-800"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-stone-900 flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-[#8E354A] text-[26px]">self_improvement</span>
          </div>

          <h2 className="font-serif text-[22px] leading-[30px] text-[#1C1B1F] dark:text-stone-100 mb-2">
            Tu registro de hoy está incompleto.
          </h2>

          <p className="text-[15px] leading-[22px] text-stone-500 dark:text-stone-400 mb-8">
            ¿Querés terminarlo o preferís continuar?
          </p>

          <div className="w-full flex flex-col gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSkipping}
              className="w-full bg-[#8E354A] text-white py-3.5 rounded-full text-[15px] font-semibold hover:opacity-90 active:scale-95 transition-all touch-manipulation"
            >
              Terminar registro
            </button>

            <button
              type="button"
              onClick={onSkip}
              disabled={isSkipping}
              className="w-full bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 py-3.5 rounded-full text-[15px] font-semibold hover:bg-stone-200 active:scale-95 transition-all touch-manipulation disabled:opacity-50"
            >
              {isSkipping ? 'Guardando...' : 'Continuar sin registrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Render via portal to escape any parent stacking context issues
  return createPortal(modalContent, document.body)
}
