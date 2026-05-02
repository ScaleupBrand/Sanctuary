import { getRecentThreads } from '@/lib/actions/historial'

// Helper for formatting date
function formatThreadDate(dateString: string) {
  const date = new Date(dateString)
  const isToday = new Date().toDateString() === date.toDateString()
  
  if (isToday) {
    return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
  }
  
  return `${date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
}

export default async function HistorialPage() {
  const threads = await getRecentThreads()

  // Helper colors for the timeline dots
  const hoverColorClasses = [
    'group-hover:bg-primary-container group-hover:border-primary-container',
    'group-hover:bg-tertiary-container group-hover:border-tertiary-container',
    'group-hover:bg-secondary-container group-hover:border-secondary-container'
  ]

  return (
    <main className="pt-8 md:pt-12 pb-32 px-container-padding-mobile md:px-container-padding-desktop max-w-4xl mx-auto">
      {/* Header */}
      <section className="mb-stack-lg">
        <h2 className="font-serif text-[32px] leading-[40px] tracking-[-0.01em] text-on-background mb-stack-sm">Tus Patrones</h2>
        <p className="text-[16px] leading-[24px] text-on-surface-variant">Observando el ritmo de tu paisaje interior.</p>
      </section>

      {/* Abstract Data Visualization */}
      <section className="mb-section-gap">
        <div className="relative w-full h-[320px] rounded-xl border-[0.5px] border-outline-variant bg-surface-container-low overflow-hidden flex flex-col justify-end p-6 group transition-all duration-700 hover:shadow-[0_12px_32px_rgba(142,53,74,0.04)]">
          {/* Blurred Organic Gradients */}
          <div className="absolute inset-0 opacity-80 mix-blend-multiply transition-transform duration-1000 group-hover:scale-105">
            <div className="absolute top-[20%] left-[10%] w-[40%] h-[60%] rounded-[100%] bg-primary-fixed-dim blur-[60px] opacity-60"></div>
            <div className="absolute bottom-[10%] right-[20%] w-[50%] h-[50%] rounded-[100%] bg-tertiary-fixed-dim blur-[80px] opacity-50"></div>
            <div className="absolute top-[40%] right-[10%] w-[30%] h-[40%] rounded-[100%] bg-secondary-fixed-dim blur-[50px] opacity-40"></div>
          </div>
          {/* Internal Micro-Structure */}
          <div className="absolute inset-0 border-[0.5px] border-outline-variant/10 rounded-xl m-2 pointer-events-none"></div>
          {/* Precise X-Axis Labels */}
          <div className="relative z-10 w-full flex justify-between border-t-[0.5px] border-outline-variant/30 pt-4 text-[12px] font-semibold tracking-[0.1em] uppercase text-on-surface-variant">
            <span>02 May</span>
            <span>09 May</span>
            <span>16 May</span>
            <span>23 May</span>
          </div>
        </div>
        {/* Narrative Insights */}
        <div className="mt-stack-lg pl-4 border-l-[0.5px] border-outline-variant">
          <p className="text-[18px] leading-[28px] text-on-background max-w-2xl">
            Has cultivado un espacio de calma notable durante el último ciclo. La tensión matutina que notaste antes se ha disipado suavemente, dando paso a una energía más suave y sostenida durante tus tardes. Continúa honrando este ritmo natural.
          </p>
        </div>
      </section>

      {/* Editorial List: Recent Threads */}
      <section>
        <div className="flex items-center gap-4 mb-stack-lg">
          <h3 className="text-[12px] font-semibold tracking-[0.1em] uppercase text-on-surface-variant shrink-0">Registros Recientes</h3>
          <div className="h-[0.5px] w-full bg-outline-variant/40"></div>
        </div>
        
        <div className="flex flex-col">
          {threads.length > 0 ? threads.map((thread, i) => {
            const hoverClass = hoverColorClasses[i % hoverColorClasses.length]
            
            return (
              <article key={thread.id} className={`group relative py-stack-lg ${i !== threads.length - 1 ? 'border-b-[0.5px] border-outline-variant/60' : ''} ml-stack-lg`}>
                <div className={`absolute -left-[37px] top-[40px] w-[10px] h-[10px] rounded-full border-[0.5px] border-outline bg-surface-container-low transition-colors ${hoverClass}`}></div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2 mb-stack-sm">
                  <h4 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-background group-hover:text-primary transition-colors">{thread.title}</h4>
                  <span className="text-[12px] font-semibold tracking-[0.15em] uppercase text-outline">{formatThreadDate(thread.date)}</span>
                </div>
                <p className="text-[16px] leading-[24px] text-on-surface-variant max-w-xl">{thread.content}</p>
              </article>
            )
          }) : (
            <p className="text-on-surface-variant italic ml-stack-lg">No hay registros recientes.</p>
          )}
        </div>
      </section>
    </main>
  )
}
