'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { CalendarPlus } from 'lucide-react'
import { toast } from 'sonner'
import { scheduleSession, type AgendaActionState } from '@/lib/actions/agenda'

type ClientaOption = {
  id: string
  nombre: string
  email: string
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-on-primary transition-colors hover:bg-surface-tint disabled:cursor-not-allowed disabled:opacity-60"
    >
      <CalendarPlus className="size-[18px]" strokeWidth={1.9} />
      {pending ? 'Agendando...' : 'Agendar sesión'}
    </button>
  )
}

export function AgendaScheduler({ clientas }: { clientas: ClientaOption[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction] = useActionState<AgendaActionState, FormData>(scheduleSession, {})

  useEffect(() => {
    if (state.success) {
      toast.success(state.success)
      formRef.current?.reset()
    }

    if (state.error) toast.error(state.error)
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[0px_4px_24px_rgba(142,53,74,0.03)]">
      <div className="mb-5">
        <h2 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-primary">Agendar nueva sesión</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Elegí clienta, fecha y hora. La sesión aparecerá también en el inicio de la clienta.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block lg:col-span-2">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Clienta</span>
          <select
            name="clienta_id"
            className="h-12 w-full rounded-full border border-outline-variant bg-surface-container-low px-4 text-sm text-on-surface outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary-fixed"
            defaultValue=""
          >
            <option value="" disabled>Seleccionar clienta</option>
            {clientas.map((clienta) => (
              <option key={clienta.id} value={clienta.id}>
                {clienta.nombre} · {clienta.email}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Fecha</span>
          <input
            name="fecha"
            type="date"
            className="h-12 w-full rounded-full border border-outline-variant bg-surface-container-low px-4 text-sm text-on-surface outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary-fixed"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Hora</span>
          <input
            name="hora"
            type="time"
            className="h-12 w-full rounded-full border border-outline-variant bg-surface-container-low px-4 text-sm text-on-surface outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary-fixed"
          />
        </label>

        <label className="block lg:col-span-2">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Notas previas</span>
          <textarea
            name="notas_previas"
            rows={4}
            placeholder="Contexto breve para llegar a la sesión con claridad..."
            className="w-full resize-y rounded-lg border border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary/40 focus:ring-2 focus:ring-primary-fixed"
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}
