import { WeeklyHistoryChart } from '@/components/historial/WeeklyHistoryChart'
import { getInsights } from '@/lib/actions/insights'
import { getRecentThreads, getWeeklyChartData } from '@/lib/actions/historial'

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
  const [threads, weeklyChartData, insights] = await Promise.all([
    getRecentThreads(),
    getWeeklyChartData(),
    getInsights(),
  ])

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

      {/* Weekly Data Visualization */}
      <section className="mb-section-gap">
        <WeeklyHistoryChart data={weeklyChartData} />
        {/* Narrative Insights */}
        <div className="mt-stack-lg pl-4 border-l-[0.5px] border-outline-variant">
          <p className="text-[18px] leading-[28px] text-on-background max-w-2xl">
            {insights.length > 0
              ? insights.join(' ')
              : 'Todavía no hay suficientes registros para observar patrones con calma.'}
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
