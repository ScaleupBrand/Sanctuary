import Link from 'next/link'
import type { ClientaSummary } from '@/lib/terapeuta/dashboard'

export function ClientaCard({ clienta }: { clienta: ClientaSummary }) {
  return (
    <Link
      href={`/terapeuta/clienta/${clienta.id}`}
      className={`relative flex flex-col overflow-hidden rounded-xl border-[0.5px] bg-surface-container-lowest p-6 shadow-[0px_4px_24px_rgba(142,53,74,0.03)] transition-all hover:shadow-md ${
        clienta.needsAttention ? 'border-secondary-container' : 'border-surface-variant'
      }`}
    >
      {clienta.needsAttention && (
        <div className="absolute right-0 top-0 p-3">
          <div className="flex items-center gap-1.5 rounded-full bg-secondary-container/30 px-3 py-1 text-[10px] uppercase tracking-widest text-on-secondary-container">
            <span className="size-1.5 rounded-full bg-secondary" />
            Requiere atención
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center gap-4 pr-8">
        <div className={`flex size-12 items-center justify-center rounded-full font-serif text-lg ${
          clienta.needsAttention ? 'bg-primary-fixed text-primary' : 'bg-surface-variant text-on-surface-variant'
        }`}>
          {clienta.initials}
        </div>
        <div>
          <h3 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-surface">{clienta.nombre}</h3>
          <p className="text-[11px] font-medium leading-[16px] text-on-surface-variant">Último registro: {clienta.lastCheckinLabel}</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="flex flex-col">
          <span className="mb-1 text-[12px] font-semibold uppercase leading-[16px] tracking-[0.04em] text-on-surface-variant">Energía</span>
          <div className="flex items-end gap-1">
            <span className="text-lg font-semibold text-primary">{clienta.averageEnergy}</span>
            {clienta.averageEnergy !== '-' && <span className="mb-1 text-xs text-outline">/5</span>}
          </div>
        </div>
        <div className="flex flex-col border-l border-surface-variant pl-4">
          <span className="mb-1 text-[12px] font-semibold uppercase leading-[16px] tracking-[0.04em] text-on-surface-variant">Crisis</span>
          <span className={`text-lg font-semibold ${clienta.needsAttention ? 'text-primary' : 'text-on-surface'}`}>{clienta.flareCount}</span>
        </div>
        <div className="flex flex-col border-l border-surface-variant pl-4">
          <span className="mb-1 text-[12px] font-semibold uppercase leading-[16px] tracking-[0.04em] text-on-surface-variant">Días</span>
          <span className={`text-lg font-semibold ${clienta.needsAttention ? 'text-primary' : 'text-on-surface'}`}>{clienta.registeredDays}/7</span>
        </div>
      </div>

      <div className="flex-grow rounded-lg bg-surface-container-low p-4">
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.1em] text-outline">Última nota</span>
        <p className="text-sm italic leading-relaxed text-on-surface">
          {clienta.latestNote ? `"${clienta.latestNote}"` : 'Sin nota registrada en los últimos 7 días.'}
        </p>
      </div>
    </Link>
  )
}
