'use client'

import { FormEvent, useState, useTransition } from 'react'
import { AlertTriangle, Info, Link as LinkIcon, Sparkles, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import {
  approveAccessRequest,
  generateClientAccessLink,
  rejectAccessRequest,
  revokeClientAccess,
  type ActiveAccessUser,
  type PendingAccessUser,
} from '@/lib/actions/accesos'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const second = parts[1]?.[0] ?? ''

  return `${first}${second}`.toUpperCase() || 'ST'
}

export function AccesosClient({
  pendingUsers,
  activeUsers,
  configError,
}: {
  pendingUsers: PendingAccessUser[]
  activeUsers: ActiveAccessUser[]
  configError?: string
}) {
  const [requests, setRequests] = useState(pendingUsers)
  const [activeClients, setActiveClients] = useState(activeUsers)
  const [email, setEmail] = useState('')
  const [accessLink, setAccessLink] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const pendingCountLabel = requests.length === 1 ? '1 pendiente' : `${requests.length} pendientes`
  const activeCountLabel = activeClients.length === 1 ? '1 activa' : `${activeClients.length} activas`

  const handleApprove = (request: PendingAccessUser) => {
    const previous = requests
    setRequests((current) => current.filter((item) => item.id !== request.id))

    startTransition(async () => {
      const result = await approveAccessRequest(request.id)
      if (result.error) {
        setRequests(previous)
        toast.error(result.error)
        return
      }

      toast.success(result.success ?? 'Acceso aprobado.')
    })
  }

  const handleReject = (request: PendingAccessUser) => {
    const previous = requests
    setRequests((current) => current.filter((item) => item.id !== request.id))

    startTransition(async () => {
      const result = await rejectAccessRequest(request.id)
      if (result.error) {
        setRequests(previous)
        toast.error(result.error)
        return
      }

      toast.success(result.success ?? 'Solicitud rechazada.')
    })
  }

  const handleRevoke = (client: ActiveAccessUser) => {
    const confirmed = window.confirm(`¿Revocar el acceso de ${client.nombre || client.email}?`)
    if (!confirmed) return

    const previous = activeClients
    setActiveClients((current) => current.filter((item) => item.id !== client.id))

    startTransition(async () => {
      const result = await revokeClientAccess(client.id)
      if (result.error) {
        setActiveClients(previous)
        toast.error(result.error)
        return
      }

      toast.success(result.success ?? 'Acceso revocado.')
    })
  }

  const handleInvite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    startTransition(async () => {
      const result = await generateClientAccessLink(email)

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (!result.link) {
        toast.error('No se pudo obtener el enlace.')
        return
      }

      const message = [
        'Hola, te comparto tu acceso a Sanctuary.',
        'Entrá desde este enlace para activar tu cuenta:',
        result.link,
      ].join('\n')

      setAccessLink(result.link)

      try {
        await navigator.clipboard.writeText(message)
        toast.success('Enlace copiado para enviar por WhatsApp.')
      } catch {
        toast.success('Enlace generado correctamente.')
      }

      setEmail('')
    })
  }

  return (
    <div className="grid grid-cols-12 items-start gap-stack-lg">
      <section className="col-span-12 lg:col-span-8">
        <div className="rounded-[24px] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_4px_24px_rgba(142,53,74,0.03)] md:p-10">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-surface">Solicitudes pendientes</h2>
              <p className="mt-1 text-sm text-on-surface-variant">Gestiona las nuevas solicitudes de acceso al sistema.</p>
            </div>
            <div className="flex w-fit items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-outline">
              <span className="size-1.5 rounded-full bg-primary/70" />
              {pendingCountLabel}
            </div>
          </div>

          {configError ? (
            <div className="rounded-xl border border-error-container bg-error-container/30 p-6 text-on-surface">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-1 size-5 text-primary" strokeWidth={1.8} />
                <div>
                  <p className="font-serif text-[22px] leading-[30px] text-primary">Falta configuración para gestionar accesos</p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{configError}</p>
                </div>
              </div>
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-0">
              <div className="hidden grid-cols-[minmax(0,1fr)_170px_220px] items-center border-b border-outline-variant/20 px-6 pr-3 py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-outline md:grid">
                <div>Información de la clienta</div>
                <div className="text-center">Registro</div>
                <div className="text-right pr-3">Acciones</div>
              </div>

              {requests.map((request, index) => (
                <div
                  key={request.id}
                  className={`grid grid-cols-1 gap-4 px-1 py-6 transition-all duration-300 hover:bg-surface-container-low/30 md:grid-cols-[minmax(0,1fr)_170px_220px] md:items-center md:px-6 md:pr-3 md:py-7 ${
                    index < requests.length - 1 ? 'border-b border-outline-variant/10' : ''
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary-container/10 font-serif text-lg text-primary">
                      {getInitials(request.nombre || request.email)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold tracking-tight text-on-surface">{request.nombre || 'Sin nombre'}</p>
                      <p className="truncate text-sm text-on-surface-variant/80">{request.email}</p>
                    </div>
                  </div>

                  <div className="text-sm text-on-surface-variant md:translate-x-4 md:text-center">
                    {formatDate(request.created_at)}
                  </div>

                  <div className="flex justify-start gap-4 md:justify-end">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleReject(request)}
                      className="px-2 text-sm font-semibold text-outline transition-colors hover:text-error disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleApprove(request)}
                      className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:bg-surface-tint hover:shadow-md disabled:opacity-50"
                    >
                      Aprobar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-10 text-center">
              <Sparkles className="mb-4 size-12 text-primary-fixed-dim" strokeWidth={1.5} />
              <p className="font-serif text-[24px] leading-[32px] text-on-surface">No hay solicitudes pendientes</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-on-surface-variant">Todo está en calma por ahora. Cuando una clienta solicite acceso, aparecerá acá.</p>
            </div>
          )}
        </div>
      </section>

      <section className="col-span-12 lg:col-span-4">
        <div className="sticky top-8 rounded-[24px] border border-outline-variant/50 bg-surface-container-low p-stack-lg">
          <div className="mb-stack-md">
            <UserPlus className="mb-4 size-8 text-primary-container" strokeWidth={1.7} />
            <h2 className="mb-2 font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-surface">Nuevo enlace</h2>
            <p className="text-sm text-on-surface-variant">Generá un acceso directo para copiar y enviar por WhatsApp.</p>
          </div>

          <form onSubmit={handleInvite} className="mt-stack-lg space-y-6">
            <div className="space-y-1">
              <label className="block text-[12px] font-semibold uppercase tracking-[0.1em] text-primary">Email de la clienta</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-3 text-[16px] outline-none transition-colors placeholder:text-stone-300 focus:border-primary-container focus:ring-0"
                placeholder="nombre@ejemplo.com"
                type="email"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-container py-4 text-[15px] font-medium text-on-primary transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              <span>{isPending ? 'Generando...' : 'Generar enlace'}</span>
              <LinkIcon className="size-[18px]" strokeWidth={1.9} />
            </button>
          </form>

          {accessLink && (
            <div className="mt-stack-md rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">Último enlace generado</p>
              <p className="break-all text-xs leading-relaxed text-on-surface-variant">{accessLink}</p>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(accessLink)
                  toast.success('Enlace copiado.')
                }}
                className="mt-3 text-xs font-semibold text-primary underline underline-offset-4"
              >
                Copiar solo enlace
              </button>
            </div>
          )}

          <div className="mt-stack-lg border-t border-outline-variant/30 pt-stack-lg">
            <div className="flex items-start gap-3">
              <Info className="mt-1 size-5 shrink-0 text-secondary" strokeWidth={1.8} />
              <p className="text-xs leading-relaxed text-on-surface-variant">
                Al generar el enlace, la clienta quedará asignada a la terapeuta activa del portal para poder acompañarla desde el panel.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="col-span-12">
        <div className="rounded-[24px] border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_4px_24px_rgba(142,53,74,0.03)] md:p-10">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-surface">Clientas con acceso</h2>
              <p className="mt-1 text-sm text-on-surface-variant">Revisá quién puede entrar al panel de clienta y revocá acceso cuando sea necesario.</p>
            </div>
            <div className="flex w-fit items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-outline">
              <span className="size-1.5 rounded-full bg-primary/70" />
              {activeCountLabel}
            </div>
          </div>

          {configError ? (
            <div className="rounded-xl border border-error-container bg-error-container/30 p-6 text-on-surface">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-1 size-5 text-primary" strokeWidth={1.8} />
                <div>
                  <p className="font-serif text-[22px] leading-[30px] text-primary">No se pudo cargar la lista de accesos</p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{configError}</p>
                </div>
              </div>
            </div>
          ) : activeClients.length > 0 ? (
            <div className="space-y-0">
              <div className="hidden grid-cols-[minmax(0,1fr)_160px_190px] items-center border-b border-outline-variant/20 px-6 py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-outline md:grid">
                <div>Clienta</div>
                <div className="text-center">Alta</div>
                <div className="text-right">Acceso</div>
              </div>

              {activeClients.map((client, index) => (
                <div
                  key={client.id}
                  className={`grid grid-cols-1 gap-4 px-1 py-6 transition-all duration-300 hover:bg-surface-container-low/30 md:grid-cols-[minmax(0,1fr)_160px_190px] md:items-center md:px-6 md:py-7 ${
                    index < activeClients.length - 1 ? 'border-b border-outline-variant/10' : ''
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary-container/10 font-serif text-lg text-primary">
                      {getInitials(client.nombre || client.email)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold tracking-tight text-on-surface">{client.nombre || 'Sin nombre'}</p>
                      <p className="truncate text-sm text-on-surface-variant/80">{client.email}</p>
                    </div>
                  </div>

                  <div className="text-sm text-on-surface-variant md:text-center">
                    {formatDate(client.created_at)}
                  </div>

                  <div className="flex justify-start md:justify-end">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleRevoke(client)}
                      className="rounded-full border border-outline-variant px-5 py-2.5 text-sm font-semibold text-on-surface-variant transition-colors hover:border-error-container hover:bg-error-container/30 hover:text-error disabled:opacity-50"
                    >
                      Revocar acceso
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-10 text-center">
              <Sparkles className="mb-4 size-12 text-primary-fixed-dim" strokeWidth={1.5} />
              <p className="font-serif text-[24px] leading-[32px] text-on-surface">Todavía no hay clientas activas</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-on-surface-variant">Cuando apruebes una solicitud o generes un enlace, aparecerá en esta lista.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
