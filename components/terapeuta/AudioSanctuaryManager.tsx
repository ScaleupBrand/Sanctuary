'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Check, ChevronDown, Circle, Plus, PlayCircle, X, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { createHerramienta, toggleHerramienta, type TherapistActionState } from '@/lib/actions/terapeuta'

type Herramienta = {
  id: string
  nombre: string
  tipo: string | null
  categoria: string | null
  duracion: number | null
  fase_metodo: number | null
  archivo_url: string | null
  contenido: string | null
  activa: boolean | null
}

type DropdownOption = {
  label: string
  value: string
}

const tipoOptions: DropdownOption[] = [
  { value: 'audio', label: 'Audio' },
  { value: 'practica', label: 'Práctica' },
  { value: 'checklist', label: 'Checklist' },
  { value: 'protocolo', label: 'Protocolo' },
]

const categoriaOptions: DropdownOption[] = [
  { value: 'respiracion', label: 'Respiración' },
  { value: 'enraizamiento', label: 'Enraizamiento' },
  { value: 'movimiento', label: 'Movimiento somático' },
  { value: 'meditacion', label: 'Meditación' },
  { value: 'regulacion', label: 'Regulación suave' },
  { value: 'emergencia', label: 'Emergencia' },
]

const faseOptions: DropdownOption[] = [
  { value: '', label: 'Todas las fases' },
  { value: '1', label: 'Fase 1' },
  { value: '2', label: 'Fase 2' },
  { value: '3', label: 'Fase 3' },
  { value: '4', label: 'Fase 4' },
]

const tipoLabels = Object.fromEntries(tipoOptions.map((option) => [option.value, option.label]))
const categoriaLabels = Object.fromEntries(categoriaOptions.map((option) => [option.value, option.label]))

function FormDropdown({
  name,
  options,
  defaultValue,
}: {
  name: string
  options: DropdownOption[]
  defaultValue: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLabel = options.find((option) => option.value === value)?.label ?? options[0]?.label

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
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between rounded-full border border-outline-variant bg-surface-container-low py-0 pl-4 pr-9 text-left text-sm text-on-surface outline-none transition-all hover:border-primary/30 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary-fixed"
      >
        <span className="truncate">{activeLabel}</span>
        <ChevronDown className={`absolute right-3 top-1/2 size-[18px] -translate-y-1/2 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} strokeWidth={1.9} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full min-w-[210px] rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-[0_16px_36px_rgba(112,30,52,0.16)]">
          {options.map((option) => {
            const isActive = value === option.value

            return (
              <button
                key={option.value || 'empty'}
                type="button"
                onClick={() => {
                  setValue(option.value)
                  setIsOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
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
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CreateButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-on-primary transition-colors hover:bg-surface-tint disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Plus className="size-[18px]" strokeWidth={1.9} />
      {pending ? 'Creando...' : 'Agregar'}
    </button>
  )
}

export function AudioSanctuaryManager({ herramientas }: { herramientas: Herramienta[] }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [state, formAction] = useActionState<TherapistActionState, FormData>(createHerramienta, {})

  useEffect(() => {
    if (state.success) {
      toast.success(state.success)
      formRef.current?.reset()
    }

    if (state.error) toast.error(state.error)
  }, [state])

  return (
    <div className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-high p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h4 className="font-serif text-lg text-primary">Audio Sanctuary</h4>
          <p className="mt-1 text-sm text-on-surface-variant">Gestioná técnicas de alivio visibles para las clientas.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating((current) => !current)}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-surface-tint"
          aria-label="Crear herramienta"
        >
          {isCreating ? <X className="size-[19px]" strokeWidth={2} /> : <Plus className="size-[19px]" strokeWidth={2} />}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {herramientas.length > 0 ? herramientas.map((herramienta) => (
          <div key={herramienta.id} className="rounded-lg bg-white/55 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                {herramienta.tipo === 'audio' ? (
                  <PlayCircle className="mt-0.5 size-5 text-primary" strokeWidth={1.8} />
                ) : (
                  <Activity className="mt-0.5 size-5 text-primary" strokeWidth={1.8} />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-on-surface">{herramienta.nombre}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-outline">
                    {herramienta.duracion ?? '-'} MIN · {tipoLabels[herramienta.tipo ?? ''] ?? 'Herramienta'}
                    {herramienta.fase_metodo ? ` · Fase ${herramienta.fase_metodo}` : ''}
                  </p>
                  <p className="mt-1 text-[11px] text-on-surface-variant">
                    Sección: {categoriaLabels[herramienta.categoria ?? 'regulacion'] ?? 'Regulación suave'}
                  </p>
                </div>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                herramienta.activa ? 'bg-primary-fixed text-primary' : 'bg-surface-container text-outline'
              }`}>
                {herramienta.activa ? 'Activa' : 'Pausada'}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              {herramienta.archivo_url ? (
                <a href={herramienta.archivo_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary underline underline-offset-4">
                  Abrir recurso
                </a>
              ) : (
                <span className="text-xs text-outline">Sin enlace externo</span>
              )}

              <form action={toggleHerramienta}>
                <input type="hidden" name="id" value={herramienta.id} />
                <input type="hidden" name="activa" value={String(Boolean(herramienta.activa))} />
                <button className="rounded-full border border-outline-variant px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:border-primary/40 hover:text-primary">
                  {herramienta.activa ? 'Pausar' : 'Activar'}
                </button>
              </form>
            </div>
          </div>
        )) : (
          <p className="rounded-lg bg-white/55 p-4 text-sm text-on-surface-variant">No hay herramientas creadas todavía.</p>
        )}
      </div>

      {isCreating && (
        <div className="mt-5 rounded-lg border border-outline-variant/50 bg-white/45 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">Crear herramienta</p>

          <form ref={formRef} action={formAction} className="mt-4 space-y-3">
            <input
              name="nombre"
              placeholder="Nombre de la técnica"
              className="h-10 w-full rounded-full border border-outline-variant bg-surface-container-low px-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary-fixed"
            />

            <div className="grid grid-cols-2 gap-3">
              <FormDropdown name="tipo" options={tipoOptions} defaultValue="audio" />
              <input
                name="duracion"
                type="number"
                min="1"
                max="180"
                placeholder="Min"
                className="h-10 rounded-full border border-outline-variant bg-surface-container-low px-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary-fixed"
              />
            </div>

            <FormDropdown name="categoria" options={categoriaOptions} defaultValue="regulacion" />
            <FormDropdown name="fase_metodo" options={faseOptions} defaultValue="" />

            <input
              name="archivo_url"
              placeholder="URL del audio o recurso"
              className="h-10 w-full rounded-full border border-outline-variant bg-surface-container-low px-4 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary-fixed"
            />

            <textarea
              name="contenido"
              rows={3}
              placeholder="Instrucciones breves o contenido del checklist..."
              className="w-full resize-y rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary-fixed"
            />

            <CreateButton />
          </form>
        </div>
      )}
    </div>
  )
}
