'use client'

import { FormEvent, useState, useTransition } from 'react'
import type { ComponentType } from 'react'
import { AudioLines, Check, Circle, Clock, FileText, PlayCircle, Plus, Trash2, Video, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  createBibliotecaResource,
  deleteBibliotecaResource,
  setBibliotecaResourceActive,
} from '@/lib/actions/terapeuta'

export type BibliotecaResource = {
  id: string
  nombre: string
  tipo: string | null
  categoria: string | null
  duracion: number | null
  archivo_url: string | null
  contenido: string | null
  activa: boolean | null
}

const categories = ['respiracion', 'enraizamiento', 'movimiento'] as const
type BibliotecaCategory = (typeof categories)[number]
type ResourceType = 'audio' | 'practica' | 'video'

const categoryLabels: Record<BibliotecaCategory, string> = {
  respiracion: 'Respiración',
  enraizamiento: 'Enraizamiento',
  movimiento: 'Movimiento Somático',
}

const categoryDots: Record<BibliotecaCategory, string> = {
  respiracion: 'bg-primary',
  enraizamiento: 'bg-secondary/50',
  movimiento: 'bg-tertiary',
}

const typeLabels: Record<string, { label: string; Icon: ComponentType<{ className?: string; strokeWidth?: number }> }> = {
  audio: { label: 'Audio', Icon: AudioLines },
  practica: { label: 'Guía escrita', Icon: FileText },
  video: { label: 'Link de video', Icon: Video },
}

function ResourceModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean
  onClose: () => void
  onCreated: (resource: BibliotecaResource) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [categoria, setCategoria] = useState<BibliotecaCategory>('respiracion')
  const [tipo, setTipo] = useState<ResourceType>('audio')

  if (!isOpen) return null

  const handleClose = () => {
    setCategoria('respiracion')
    setTipo('audio')
    onClose()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      const result = await createBibliotecaResource(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.resource) {
        onCreated(result.resource)
        toast.success(result.success ?? 'Recurso creado.')
        form.reset()
        handleClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-inverse-surface/35 p-4 backdrop-blur-sm">
      <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_24px_80px_rgba(112,30,52,0.22)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-outline">Biblioteca</p>
            <h2 className="mt-1 font-serif text-[28px] leading-[36px] tracking-[-0.01em] text-primary">Nuevo recurso</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-low"
            aria-label="Cerrar modal"
          >
            <X className="size-5" strokeWidth={1.9} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="categoria" value={categoria} />
          <input type="hidden" name="tipo" value={tipo} />

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Nombre</label>
            <input
              name="nombre"
              placeholder="Ej. Respiración para la calma"
              className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 text-[15px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary-fixed"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Categoría</p>
              <div className="grid grid-cols-1 gap-2">
                {categories.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCategoria(option)}
                    className={`flex h-11 items-center justify-between rounded-lg border px-3 text-sm transition-colors ${
                      categoria === option
                        ? 'border-primary bg-primary-fixed text-primary'
                        : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-primary/30'
                    }`}
                  >
                    {categoryLabels[option]}
                    {categoria === option ? (
                      <Check className="size-[18px]" strokeWidth={2} />
                    ) : (
                      <Circle className="size-[18px]" strokeWidth={1.7} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Tipo</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'audio', label: 'Audio', Icon: AudioLines },
                  { value: 'practica', label: 'Guía', Icon: FileText },
                  { value: 'video', label: 'Video', Icon: PlayCircle },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTipo(option.value as ResourceType)}
                    className={`flex h-24 flex-col items-center justify-center gap-2 rounded-lg border text-xs font-semibold transition-colors ${
                      tipo === option.value
                        ? 'border-primary bg-primary-fixed text-primary'
                      : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-primary/30'
                    }`}
                  >
                    <option.Icon className="size-6" strokeWidth={1.8} />
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Duración</label>
                <input
                  name="duracion"
                  type="number"
                  min="1"
                  max="180"
                  placeholder="Minutos"
                  className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 text-[15px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary-fixed"
                />
              </div>
            </div>
          </div>

          {tipo === 'audio' && (
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Archivo de audio</label>
              <input
                name="archivo"
                type="file"
                accept=".mp3,.m4a,audio/mpeg,audio/mp4"
                className="w-full rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface-variant file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-primary"
              />
            </div>
          )}

          {tipo === 'practica' && (
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Pasos de la guía</label>
              <textarea
                name="contenido"
                rows={7}
                placeholder={'Escribí un paso por línea.\nEj. 1. Apoyá los pies en el suelo.\n2. Llevá la atención a la respiración.'}
                className="w-full resize-y rounded-lg border border-outline-variant bg-surface-container-low p-4 text-[15px] leading-6 outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary-fixed"
              />
            </div>
          )}

          {tipo === 'video' && (
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Link de YouTube o Vimeo</label>
              <input
                name="video_url"
                type="url"
                placeholder="https://youtube.com/..."
                className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 text-[15px] outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary-fixed"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-outline-variant/50 pt-5">
            <button
              type="button"
              onClick={handleClose}
              className="h-12 rounded-sm border border-outline-variant px-5 text-sm font-semibold text-on-surface-variant transition-colors hover:border-primary/40 hover:text-primary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-primary px-6 text-sm font-semibold text-on-primary transition-colors hover:bg-surface-tint disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="size-[18px]" strokeWidth={1.9} />
              {isPending ? 'Guardando...' : 'Crear recurso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Toggle({
  resource,
  onToggle,
}: {
  resource: BibliotecaResource
  onToggle: (resource: BibliotecaResource, active: boolean) => void
}) {
  const isActive = Boolean(resource.activa)

  return (
    <button
      type="button"
      onClick={() => onToggle(resource, !isActive)}
      aria-label={isActive ? 'Pausar recurso' : 'Activar recurso'}
      className={`relative h-6 w-12 rounded-full border transition-colors ${
        isActive ? 'border-primary bg-primary/5' : 'border-[#d5c2c2] bg-white'
      }`}
    >
      <span className={`absolute top-1 size-4 rounded-full shadow-sm transition-all ${isActive ? 'right-1 bg-primary' : 'left-1 bg-[#d5c2c2]'}`} />
    </button>
  )
}

function ResourceCard({
  resource,
  index,
  onToggle,
  onDelete,
}: {
  resource: BibliotecaResource
  index: number
  onToggle: (resource: BibliotecaResource, active: boolean) => void
  onDelete: (resource: BibliotecaResource) => void
}) {
  const category = (resource.categoria ?? 'respiracion') as BibliotecaCategory
  const type = typeLabels[resource.tipo ?? ''] ?? typeLabels.practica
  const TypeIcon = type.Icon
  const isActive = Boolean(resource.activa)

  return (
    <article className="mb-8 break-inside-avoid rounded-sm border border-[#f0e6e6] bg-surface-container-lowest p-8 shadow-[0_8px_30px_rgba(142,53,74,0.04)] transition-all duration-500 hover:shadow-[0_12px_40px_rgba(142,53,74,0.08)]">
      <div className="relative">
        <span className="pointer-events-none absolute right-0 top-0 font-serif text-[40px] leading-none text-[#f8f3f2]">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="mb-10 pr-14">
          <div className="mb-6 flex items-center gap-2">
            <span className={`size-1.5 rounded-full ${categoryDots[category] ?? 'bg-primary'}`} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
              {categoryLabels[category] ?? 'Regulación'}
            </span>
          </div>

          <h3 className="mb-4 font-serif text-[26px] leading-tight text-on-background">{resource.nombre}</h3>

          {resource.contenido && (
            <p className="mb-6 line-clamp-3 text-sm italic leading-relaxed text-[#795541]">{resource.contenido}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#795541]">
            <span className="flex items-center gap-1.5 rounded-full border border-[#f0e6e6] bg-[#fcf9f8] px-3 py-1">
              <TypeIcon className="size-[14px]" strokeWidth={1.8} />
              {type.label}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-[14px]" strokeWidth={1.8} />
              {resource.duracion ?? '-'} min
            </span>
            {resource.archivo_url && (
              <a
                href={resource.archivo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-primary underline underline-offset-4"
              >
                Abrir recurso
              </a>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-[#f0e6e6]/70 pt-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a68b8b]">Estado</span>
            <span className={`text-[13px] font-semibold ${isActive ? 'text-primary' : 'text-[#a68b8b] italic'}`}>
              {isActive ? 'Disponible' : 'En pausa'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onDelete(resource)}
              aria-label="Eliminar recurso"
              className="flex size-9 items-center justify-center rounded-full text-outline transition-colors hover:bg-error-container hover:text-error"
            >
              <Trash2 className="size-[18px]" strokeWidth={1.8} />
            </button>
            <Toggle resource={resource} onToggle={onToggle} />
          </div>
        </div>
      </div>
    </article>
  )
}

function EmptyCategory({ category }: { category: BibliotecaCategory }) {
  return (
    <div className="rounded-sm border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-[#795541]">
      <p className="font-serif text-[22px] leading-[30px] text-on-background">{categoryLabels[category]}</p>
      <p className="mt-2 max-w-md text-[15px] leading-6">
        Aún no hay recursos en esta categoría. Agregá el primero.
      </p>
    </div>
  )
}

export function BibliotecaClient({ resources }: { resources: BibliotecaResource[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [items, setItems] = useState(resources)
  const [, startTransition] = useTransition()

  const handleCreated = (resource: BibliotecaResource) => {
    setItems((current) => [resource, ...current.filter((item) => item.id !== resource.id)])
  }

  const handleToggle = (resource: BibliotecaResource, active: boolean) => {
    const previous = items
    setItems((current) => current.map((item) => item.id === resource.id ? { ...item, activa: active } : item))

    startTransition(async () => {
      const result = await setBibliotecaResourceActive(resource.id, active)
      if (result.error) {
        setItems(previous)
        toast.error(result.error)
        return
      }

      toast.success(result.success ?? 'Estado actualizado.')
    })
  }

  const handleDelete = (resource: BibliotecaResource) => {
    if (!window.confirm(`¿Eliminar "${resource.nombre}" de la biblioteca?`)) return

    const previous = items
    setItems((current) => current.filter((item) => item.id !== resource.id))

    startTransition(async () => {
      const result = await deleteBibliotecaResource(resource.id)
      if (result.error) {
        setItems(previous)
        toast.error(result.error)
        return
      }

      toast.success(result.success ?? 'Recurso eliminado.')
    })
  }

  return (
    <>
      <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="relative">
          <div className="absolute -left-10 top-6 hidden h-px w-8 bg-primary opacity-30 md:block" />
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-outline">Biblioteca</p>
          <h1 className="mb-4 font-serif text-[44px] leading-tight tracking-tight text-on-background">
            Recursos y<br />
            <span className="italic text-primary">Prácticas Somáticas</span>
          </h1>
          <p className="max-w-xl text-[17px] leading-relaxed text-[#795541]">
            Una colección cuidadosamente seleccionada de herramientas para acompañar el proceso de regulación de tus clientas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-sm border border-primary bg-primary px-6 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-surface-tint md:self-start"
        >
          <Plus className="size-4" strokeWidth={1.9} />
          Nuevo recurso
        </button>
      </div>

      <div className="space-y-section-gap">
        {categories.map((category) => {
          const categoryResources = items.filter((resource) => resource.categoria === category)

          return (
            <section key={category} className="space-y-stack-lg">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">{categoryLabels[category]}</p>
                <div className="mt-3 h-px w-full bg-outline-variant/40" />
              </div>

              {categoryResources.length > 0 ? (
                <div className="columns-1 gap-8 md:columns-2 xl:columns-3">
                  {categoryResources.map((resource, index) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      index={index}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <EmptyCategory category={category} />
              )}
            </section>
          )
        })}
      </div>

      <ResourceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={handleCreated} />
    </>
  )
}
