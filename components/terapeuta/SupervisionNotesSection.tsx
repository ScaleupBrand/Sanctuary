'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { Edit3 } from 'lucide-react'
import { toast } from 'sonner'
import { saveSupervisionNote, type TherapistActionState } from '@/lib/actions/terapeuta'

type SupervisionNote = {
  id: string
  contenido: string
  created_at: string
}

function formatNoteDate(value: string) {
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function SaveButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-surface-tint disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Edit3 className="size-[18px]" strokeWidth={1.8} />
      {pending ? 'Guardando...' : 'Guardar nota'}
    </button>
  )
}

export function SupervisionNotesSection({ notes }: { notes: SupervisionNote[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction] = useActionState<TherapistActionState, FormData>(saveSupervisionNote, {})

  useEffect(() => {
    if (state.success) {
      toast.success(state.success)
      formRef.current?.reset()
    }

    if (state.error) toast.error(state.error)
  }, [state])

  return (
    <section className="mb-stack-lg mt-section-gap">
      <div className="rounded-xl border border-dotted border-outline-variant bg-surface-container-highest/30 p-8">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-surface">Tus Notas de Supervisión</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Apuntes internos para preparar próximas sesiones o revisar casos con más calma.</p>
          </div>
        </div>

        <form ref={formRef} action={formAction} className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-4 shadow-[0px_4px_24px_rgba(142,53,74,0.03)]">
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Nueva nota</span>
            <textarea
              name="contenido"
              rows={5}
              maxLength={3000}
              placeholder="Ej: Revisar el caso de Elena con foco en descanso, adherencia y brotes de la semana..."
              className="min-h-[150px] w-full resize-y rounded-lg border border-outline-variant bg-surface-container-low p-4 font-serif text-lg italic leading-relaxed text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary/40 focus:ring-2 focus:ring-primary-fixed"
            />
          </label>
          <div className="mt-4 flex justify-end">
            <SaveButton />
          </div>
        </form>

        <div className="mt-6">
          <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Notas guardadas</h4>
          {notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note) => (
                <article key={note.id} className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface">{note.contenido}</p>
                  <time className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.08em] text-outline">
                    {formatNoteDate(note.created_at)}
                  </time>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-lg bg-surface-container-low p-4 text-sm text-on-surface-variant">Todavía no hay notas guardadas.</p>
          )}
        </div>
      </div>
    </section>
  )
}
