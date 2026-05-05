import Link from 'next/link'
import { completeRegulationPractice } from '@/lib/actions/regulacion'
import { createClient } from '@/lib/supabase/server'
import { CompletePracticeButton } from './CompletePracticeButton'

type PracticeCategory = 'respiracion' | 'enraizamiento' | 'movimiento'

type Herramienta = {
  id: string
  nombre: string
  tipo: string | null
  categoria: string | null
  duracion: number | null
  fase_metodo: number | null
  archivo_url: string | null
  contenido: string | null
}

const categoryFallbackTitle: Record<PracticeCategory, string> = {
  respiracion: 'Respiración',
  enraizamiento: 'Enraizamiento',
  movimiento: 'Movimiento somático',
}

const categoryIcon: Record<PracticeCategory, string> = {
  respiracion: 'air',
  enraizamiento: 'spa',
  movimiento: 'self_improvement',
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

async function getHerramienta(category: PracticeCategory, herramientaId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('herramientas')
    .select('id, nombre, tipo, categoria, duracion, fase_metodo, archivo_url, contenido')
    .eq('activa', true)
    .eq('categoria', category)

  if (herramientaId && isUuid(herramientaId)) query = query.eq('id', herramientaId)

  const { data } = await query
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data as Herramienta | null
}

function splitSteps(contenido: string | null) {
  if (!contenido?.trim()) {
    return ['Tomate un momento para acomodarte con suavidad.', 'Respirá a tu ritmo, sin forzar nada.', 'Volvé cuando sientas que tu cuerpo encontró un poco más de espacio.']
  }

  const normalized = contenido
    .replace(/\r/g, '')
    .split(/\n+|(?:^|\s)\d+[\).\s-]+/g)
    .map((step) => step.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)

  if (normalized.length > 1) return normalized

  return contenido
    .split(/(?<=[.!?])\s+/g)
    .map((step) => step.trim())
    .filter(Boolean)
}

function formatDuration(herramienta: Herramienta) {
  const duration = herramienta.duracion ? `${herramienta.duracion} min` : 'Práctica breve'
  const fase = herramienta.fase_metodo ? ` · Fase ${herramienta.fase_metodo}` : ''

  return `${duration}${fase}`
}

function PracticeHeader({ herramienta, category }: { herramienta: Herramienta | null; category: PracticeCategory }) {
  return (
    <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center border-b-[0.5px] border-outline-variant bg-background/95 px-6 backdrop-blur-md">
      <Link
        href="/regulacion"
        aria-label="Volver a regulación"
        className="mr-4 flex h-11 w-11 items-center justify-center rounded-full text-primary transition-colors hover:bg-surface-container-low"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </Link>
      <div className="min-w-0">
        <h1 className="truncate font-serif text-lg font-bold tracking-tight text-primary">
          {herramienta?.nombre ?? categoryFallbackTitle[category]}
        </h1>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
          {herramienta ? formatDuration(herramienta) : 'Sin práctica activa'}
        </p>
      </div>
    </header>
  )
}

function EmptyPractice({ category }: { category: PracticeCategory }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center px-container-padding-mobile py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-fixed text-primary">
        <span className="material-symbols-outlined text-[36px]">{categoryIcon[category]}</span>
      </div>
      <h2 className="font-serif text-[32px] leading-[40px] tracking-[-0.01em] text-on-surface">
        No hay práctica activa todavía
      </h2>
      <p className="mt-3 text-[16px] leading-[26px] text-on-surface-variant">
        Cuando Almudena active una herramienta de {categoryFallbackTitle[category].toLowerCase()}, vas a poder verla acá.
      </p>
      <Link
        href="/regulacion"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-[15px] font-medium text-on-primary transition-colors hover:bg-surface-tint"
      >
        Volver a regulación
      </Link>
    </main>
  )
}

function AudioPractice({ herramienta, category }: { herramienta: Herramienta; category: PracticeCategory }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center px-container-padding-mobile pb-10 pt-24">
      <div className="mb-stack-lg flex aspect-square w-full max-w-[320px] items-center justify-center rounded-full border-[0.5px] border-outline-variant bg-surface-container shadow-[0_12px_24px_rgba(142,53,74,0.04)]">
        <div className="flex h-36 w-36 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-[inset_0_0_0_1px_rgba(218,192,195,0.7)]">
          <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {categoryIcon[category]}
          </span>
        </div>
      </div>

      <div className="mb-stack-lg w-full text-center">
        <h2 className="font-serif text-[32px] leading-[40px] tracking-[-0.01em] text-on-surface">{herramienta.nombre}</h2>
        {herramienta.contenido && (
          <p className="mx-auto mt-3 max-w-md text-[16px] leading-[26px] text-on-surface-variant">{herramienta.contenido}</p>
        )}
      </div>

      <div className="mb-section-gap w-full rounded-xl border-[0.5px] border-outline-variant bg-surface-container-lowest p-4 shadow-[0_8px_24px_rgba(112,30,52,0.04)]">
        {herramienta.archivo_url ? (
          <audio controls preload="metadata" src={herramienta.archivo_url} className="w-full accent-primary">
            Tu navegador no puede reproducir este audio.
          </audio>
        ) : (
          <p className="text-center text-[15px] leading-[24px] text-on-surface-variant">
            Esta práctica está marcada como audio, pero todavía no tiene archivo cargado.
          </p>
        )}
      </div>

      <form action={completeRegulationPractice} className="mt-auto w-full">
        <input type="hidden" name="herramienta_id" value={herramienta.id} />
        <CompletePracticeButton label="Finalizar práctica" />
      </form>
    </main>
  )
}

function VideoPractice({ herramienta }: { herramienta: Herramienta }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center px-container-padding-mobile pb-10 pt-24">
      <div className="mb-stack-lg flex aspect-square w-full max-w-[320px] items-center justify-center rounded-full border-[0.5px] border-outline-variant bg-surface-container shadow-[0_12px_24px_rgba(142,53,74,0.04)]">
        <div className="flex h-36 w-36 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-[inset_0_0_0_1px_rgba(218,192,195,0.7)]">
          <span className="material-symbols-outlined text-[64px]">play_circle</span>
        </div>
      </div>

      <div className="mb-stack-lg w-full text-center">
        <h2 className="font-serif text-[32px] leading-[40px] tracking-[-0.01em] text-on-surface">{herramienta.nombre}</h2>
        <p className="mx-auto mt-3 max-w-md text-[16px] leading-[26px] text-on-surface-variant">
          Abrí el video en una nueva pestaña y volvé cuando hayas terminado.
        </p>
      </div>

      <a
        href={herramienta.archivo_url ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-section-gap inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-[15px] font-medium text-on-primary transition-colors hover:bg-surface-tint"
      >
        Abrir video
        <span className="material-symbols-outlined text-[18px]">north_east</span>
      </a>

      <form action={completeRegulationPractice} className="mt-auto w-full">
        <input type="hidden" name="herramienta_id" value={herramienta.id} />
        <CompletePracticeButton label="He terminado" />
      </form>
    </main>
  )
}

function TextPractice({ herramienta }: { herramienta: Herramienta }) {
  const steps = splitSteps(herramienta.contenido)

  return (
    <main className="mx-auto min-h-dvh w-full max-w-screen-md px-container-padding-mobile pb-10 pt-28 md:px-container-padding-desktop">
      <section className="mb-section-gap">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-secondary">{formatDuration(herramienta)}</p>
        <h2 className="font-serif text-[32px] leading-[42px] tracking-[-0.01em] text-primary">{herramienta.nombre}</h2>
      </section>

      <section className="relative space-y-8 md:space-y-10">
        <div className="absolute bottom-10 left-[3.25rem] top-10 hidden w-px bg-outline-variant md:block" />
        {steps.map((step, index) => (
          <div
            key={`${herramienta.id}-${index}`}
            className="relative z-10 flex items-start gap-6 rounded-xl border-[0.5px] border-outline-variant bg-surface-container-high p-8 shadow-[0_12px_24px_rgba(112,30,52,0.03)]"
          >
            <span className="min-w-[44px] font-serif text-[40px] leading-none text-primary-container">{index + 1}</span>
            <p className="pt-1 text-[18px] leading-[30px] text-on-surface">{step}</p>
          </div>
        ))}
      </section>

      <form action={completeRegulationPractice} className="pt-section-gap">
        <input type="hidden" name="herramienta_id" value={herramienta.id} />
        <CompletePracticeButton label="He terminado" />
      </form>
    </main>
  )
}

export async function RegulationPracticePage({
  category,
  herramientaId,
}: {
  category: PracticeCategory
  herramientaId?: string
}) {
  const herramienta = await getHerramienta(category, herramientaId)

  return (
    <div className="min-h-dvh bg-background text-on-background">
      <PracticeHeader herramienta={herramienta} category={category} />
      {!herramienta ? (
        <EmptyPractice category={category} />
      ) : herramienta.tipo === 'audio' ? (
        <AudioPractice herramienta={herramienta} category={category} />
      ) : herramienta.tipo === 'video' ? (
        <VideoPractice herramienta={herramienta} />
      ) : (
        <TextPractice herramienta={herramienta} />
      )}
    </div>
  )
}
