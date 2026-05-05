import Link from 'next/link'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { SortDropdown } from '@/components/terapeuta/SortDropdown'
import {
  clientFilterLabels,
  clientSortLabels,
  type ClientFilter,
  type ClientSort,
} from '@/lib/terapeuta/dashboard'

export function ClientasFilters({
  basePath,
  searchTerm,
  activeFilter,
  activeSort,
  filterCounts,
  showing,
  total,
}: {
  basePath: string
  searchTerm: string
  activeFilter: ClientFilter
  activeSort: ClientSort
  filterCounts: Record<ClientFilter, number>
  showing: number
  total: number
}) {
  const hasActiveControls = Boolean(searchTerm.trim()) || activeFilter !== 'todas' || activeSort !== 'prioridad'
  const hrefFor = (values: { filter?: ClientFilter; sort?: ClientSort }) => {
    const nextFilter = values.filter ?? activeFilter
    const nextSort = values.sort ?? activeSort
    const query = new URLSearchParams()

    if (searchTerm.trim()) query.set('q', searchTerm.trim())
    if (nextFilter !== 'todas') query.set('filtro', nextFilter)
    if (nextSort !== 'prioridad') query.set('ordenar', nextSort)

    const value = query.toString()
    return value ? `${basePath}?${value}` : basePath
  }
  const sortOptions = (Object.keys(clientSortLabels) as ClientSort[]).map((sort) => ({
    value: sort,
    label: clientSortLabels[sort],
    href: hrefFor({ sort }),
  }))

  return (
    <div className="mt-8 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-[0px_4px_24px_rgba(142,53,74,0.03)]">
      <form action={basePath} method="get" className="grid gap-4 xl:grid-cols-[1fr_220px_auto] xl:items-end">
        {activeFilter !== 'todas' && <input type="hidden" name="filtro" value={activeFilter} />}
        {activeSort !== 'prioridad' && <input type="hidden" name="ordenar" value={activeSort} />}

        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Buscar clienta</span>
          <span className="relative block">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary" strokeWidth={1.8} />
            <input
              name="q"
              defaultValue={searchTerm}
              className="h-12 w-full rounded-full border border-outline-variant bg-surface-container-low pl-12 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary/40 focus:ring-2 focus:ring-primary-fixed"
              placeholder="Nombre, apellido o email..."
              type="search"
            />
          </span>
        </label>

        <div>
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.1em] text-outline">Ordenar por</span>
          <SortDropdown activeSort={activeSort} options={sortOptions} />
        </div>

        <button
          type="submit"
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-on-primary transition-colors hover:bg-surface-tint"
        >
          <SlidersHorizontal className="size-[18px]" strokeWidth={1.9} />
          Aplicar
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-outline-variant/40 pt-4">
        {(Object.keys(clientFilterLabels) as ClientFilter[]).map((filter) => {
          const isActive = activeFilter === filter

          return (
            <Link
              key={filter}
              href={hrefFor({ filter })}
              className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                isActive
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:border-primary/30 hover:text-primary'
              }`}
            >
              {clientFilterLabels[filter]} · {filterCounts[filter]}
            </Link>
          )
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-outline-variant/40 pt-4 text-sm text-on-surface-variant md:flex-row md:items-center md:justify-between">
        <p>
          Mostrando <span className="font-semibold text-on-surface">{showing}</span> de{' '}
          <span className="font-semibold text-on-surface">{total}</span> clientas
          {searchTerm.trim() && <> para “{searchTerm.trim()}”</>}.
        </p>

        {hasActiveControls && (
          <Link href={basePath} className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-70">
            <X className="size-[18px]" strokeWidth={1.9} />
            Limpiar filtros
          </Link>
        )}
      </div>
    </div>
  )
}
