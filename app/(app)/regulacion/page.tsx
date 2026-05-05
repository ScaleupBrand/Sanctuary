import { SessionPrepForm } from '@/components/regulacion/SessionPrepForm'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

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

const toolIcons: Record<string, string> = {
  audio: 'play_circle',
  practica: 'self_improvement',
  checklist: 'checklist',
  protocolo: 'emergency',
  video: 'play_circle',
}

const sectionLabels: Record<string, string> = {
  respiracion: 'Respiración',
  enraizamiento: 'Enraizamiento',
  movimiento: 'Movimiento somático',
  meditacion: 'Meditación',
  regulacion: 'Regulación suave',
  emergencia: 'Protocolo de emergencia',
}

const practiceRoutes: Record<string, string> = {
  respiracion: '/regulacion/respiracion',
  enraizamiento: '/regulacion/enraizamiento',
  movimiento: '/regulacion/movimiento-somatico',
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

async function getHerramientas() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('herramientas')
    .select('id, nombre, tipo, categoria, duracion, fase_metodo, archivo_url, contenido')
    .eq('activa', true)
    .order('created_at', { ascending: false })
    .limit(12)

  return (data ?? []) as Herramienta[]
}

export default async function RegulacionPage() {
  const herramientas = await getHerramientas()
  const herramientasPorSeccion = herramientas.reduce<Record<string, Herramienta[]>>((acc, herramienta) => {
    const section = herramienta.categoria ?? 'regulacion'
    acc[section] = [...(acc[section] ?? []), herramienta]
    return acc
  }, {})

  return (
    <main className="mx-auto w-full max-w-3xl flex-grow space-y-section-gap px-container-padding-mobile pb-32 md:px-container-padding-desktop md:pt-8">
      <div className="pt-8">
        <h1 className="mb-stack-sm font-serif text-[40px] leading-[48px] tracking-[-0.02em] text-on-background">
          Regulación
        </h1>
        <p className="max-w-lg text-[18px] leading-[28px] text-on-surface-variant">
          Herramientas para devolverle la calma a tu sistema nervioso.
        </p>
      </div>

      <section className="relative flex flex-col gap-stack-md overflow-hidden rounded-xl bg-primary p-6 text-on-primary shadow-[0_12px_24px_rgba(112,30,52,0.05)] md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 opacity-20">
          <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
        </div>
        <div className="relative z-10 flex items-center gap-stack-sm">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
          <h2 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em]">Protocolo de Emergencia</h2>
        </div>
        <p className="relative z-10 max-w-lg text-[18px] leading-[28px] opacity-90">
          Técnicas de anclaje rápido para reducir la hiperactividad del sistema nervioso.
        </p>
        <a href="#herramientas-regulacion" className="mt-4 self-start rounded-lg bg-on-primary px-6 py-3 text-[15px] font-medium text-primary shadow-sm transition-colors hover:bg-surface-container-lowest">
          Ver herramientas
        </a>
      </section>

      <section id="herramientas-regulacion" className="space-y-stack-lg">
        <h2 className="font-serif text-[32px] leading-[40px] tracking-[-0.01em] text-on-surface">Prácticas de Alivio</h2>
        {herramientas.length > 0 ? (
          <div className="space-y-stack-lg">
            {Object.entries(herramientasPorSeccion).map(([section, sectionTools]) => (
            <div key={section} className="space-y-stack-sm">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-primary">
                {sectionLabels[section] ?? 'Regulación'}
              </h3>
              <div className="grid grid-cols-1 gap-stack-md md:grid-cols-2">
                {sectionTools.map((herramienta, index) => {
                  const icon = toolIcons[herramienta.tipo ?? ''] ?? 'self_care'
                  const content = (
                    <>
                      <div className="mb-2 flex w-full items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-low transition-colors group-hover:bg-primary-fixed">
                          <span className="material-symbols-outlined text-2xl text-primary">{icon}</span>
                        </div>
                        <span className="material-symbols-outlined text-outline-variant transition-colors group-hover:text-primary">
                          {practiceRoutes[section] ? 'arrow_forward' : 'spa'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-serif text-2xl text-on-surface">{herramienta.nombre}</h4>
                        <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-outline">
                          {herramienta.duracion ?? '-'} min
                          {herramienta.fase_metodo ? ` · Fase ${herramienta.fase_metodo}` : ''}
                        </p>
                      </div>
                      <p className="text-[16px] leading-[24px] text-on-surface-variant">
                        {herramienta.contenido || 'Práctica de regulación disponible para acompañarte hoy.'}
                      </p>
                    </>
                  )

                  const className = `group flex flex-col items-start gap-stack-sm rounded-xl border-[0.5px] border-outline-variant bg-surface-container-lowest p-6 text-left shadow-[0_4px_24px_rgba(142,53,74,0.02)] transition-colors hover:bg-surface-container-low ${
                    index === 2 ? 'md:col-span-2' : ''
                  }`

                  const practiceHref = practiceRoutes[section]
                    ? `${practiceRoutes[section]}${isUuid(herramienta.id) ? `?h=${herramienta.id}` : ''}`
                    : null

                  if (practiceHref) {
                    return (
                      <Link key={herramienta.id} href={practiceHref} className={className}>
                        {content}
                      </Link>
                    )
                  }

                  return (
                    <div key={herramienta.id} className={className}>
                      {content}
                    </div>
                  )
                })}
              </div>
            </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-[0.5px] border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center shadow-[0_4px_24px_rgba(142,53,74,0.02)]">
            <span className="material-symbols-outlined mb-4 text-5xl text-primary-fixed-dim">spa</span>
            <p className="font-serif text-[24px] leading-[32px] text-on-surface">Todavía no hay prácticas activas</p>
            <p className="mx-auto mt-2 max-w-md text-[15px] leading-6 text-on-surface-variant">
              Cuando Almudena active una herramienta de regulación, vas a poder verla acá.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-stack-lg">
        <h2 className="font-serif text-[32px] leading-[40px] tracking-[-0.01em] text-on-surface">Preparación de Sesión</h2>
        <div className="space-y-stack-md rounded-xl border-[0.5px] border-outline-variant bg-surface-container-lowest p-6 shadow-[0_4px_24px_rgba(142,53,74,0.02)] md:p-8">
          <p className="text-[16px] leading-[24px] text-on-surface-variant">Organiza tus pensamientos y emociones antes de tu próxima cita para aprovechar el tiempo al máximo.</p>
          <SessionPrepForm />
        </div>
      </section>
    </main>
  )
}
