import React from 'react'
import Link from 'next/link'

export default function ComoFuncionaPage() {
  return (
    <>
      {/* TopAppBar */}
      <header className="bg-[#FAF7F2] dark:bg-stone-950 border-b-[0.5px] border-rose-100 dark:border-stone-800 fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-opacity-90 backdrop-blur-md">
        <Link href="/onboarding/bienvenida" aria-label="Volver" className="material-symbols-outlined text-[#8E354A] dark:text-rose-400 hover:opacity-70 transition-opacity duration-300 active:scale-95">
          arrow_back
        </Link>
        <span className="text-xl font-serif italic text-[#8E354A] dark:text-rose-300">
          2 of 4
        </span>
        <Link href="/onboarding/tu-nombre" className="font-serif text-[#8E354A] dark:text-rose-300 font-medium hover:opacity-70 transition-opacity duration-300 active:scale-95">
          Skip
        </Link>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-container-padding-mobile md:px-container-padding-desktop pt-[104px] pb-container-padding-mobile flex flex-col min-h-screen">
        {/* Headline */}
        <h1 className="font-h1-serif text-h1-serif text-primary mb-section-gap text-left">
          Cómo te acompañamos
        </h1>

        {/* Feature Grid/Vertical List */}
        <div className="flex flex-col gap-stack-lg flex-1">
          {/* Section 1: Registro Diario */}
          <div className="group bg-surface-container-lowest border-[0.5px] border-outline-variant rounded-xl p-8 shadow-[0_12px_24px_rgba(112,30,52,0.03)] flex flex-col md:flex-row md:items-center gap-stack-md transition-all duration-300 hover:shadow-[0_16px_32px_rgba(112,30,52,0.05)]">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container shrink-0">
              <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'wght' 200, 'FILL' 0" }}>edit_calendar</span>
            </div>
            <div>
              <h2 className="font-h2-serif text-h2-serif text-on-surface mb-stack-sm">Registro Diario</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Un espacio breve para documentar tu estado emocional al iniciar o terminar el día.</p>
            </div>
          </div>

          {/* Section 2: Registro de Brotes */}
          <div className="group bg-surface-container-lowest border-[0.5px] border-outline-variant rounded-xl p-8 shadow-[0_12px_24px_rgba(112,30,52,0.03)] flex flex-col md:flex-row md:items-center gap-stack-md transition-all duration-300 hover:shadow-[0_16px_32px_rgba(112,30,52,0.05)]">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container shrink-0">
              <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'wght' 200, 'FILL' 0" }}>monitoring</span>
            </div>
            <div>
              <h2 className="font-h2-serif text-h2-serif text-on-surface mb-stack-sm">Registro de Brotes</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Captura momentos críticos para identificar detonantes y patrones con claridad.</p>
            </div>
          </div>

          {/* Section 3: Herramientas de Alivio */}
          <div className="group bg-surface-container-lowest border-[0.5px] border-outline-variant rounded-xl p-8 shadow-[0_12px_24px_rgba(112,30,52,0.03)] flex flex-col md:flex-row md:items-center gap-stack-md transition-all duration-300 hover:shadow-[0_16px_32px_rgba(112,30,52,0.05)]">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container shrink-0">
              <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'wght' 200, 'FILL' 0" }}>spa</span>
            </div>
            <div>
              <h2 className="font-h2-serif text-h2-serif text-on-surface mb-stack-sm">Herramientas de Alivio</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Ejercicios guiados y técnicas de regulación para recuperar tu centro.</p>
            </div>
          </div>
        </div>

        {/* Primary CTA Area */}
        <div className="mt-section-gap w-full md:w-auto md:self-end pb-8">
          <Link href="/onboarding/tu-nombre" className="w-full md:w-auto bg-primary text-on-primary font-button-text text-button-text px-10 py-4 rounded-full transition-all duration-300 hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2">
            Entendido
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'wght' 300" }}>arrow_forward</span>
          </Link>
        </div>
      </main>
    </>
  )
}
