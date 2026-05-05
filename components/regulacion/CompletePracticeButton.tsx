'use client'

import { useFormStatus } from 'react-dom'

export function CompletePracticeButton({ label }: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-14 w-full items-center justify-center rounded-full bg-primary text-[15px] font-medium text-on-primary shadow-[0_4px_12px_rgba(142,53,74,0.12)] transition-colors hover:bg-surface-tint disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:px-8"
    >
      {pending ? 'Guardando...' : label}
    </button>
  )
}
