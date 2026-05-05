'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { saveBrote } from '@/lib/actions/brotes'

export default function BrotePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 1 — ¿Cómo estás ahora?
  const [zonaCorporal, setZonaCorporal] = useState('')
  const [intensidad, setIntensidad] = useState(3)

  // Step 2 — ¿Qué lo desencadenó?
  const [posibleCausa, setPosibleCausa] = useState('')
  const [quePasoAntes, setQuePasoAntes] = useState('')

  // Step 3 — ¿Cómo estás respondiendo?
  const [queHizoParaRegularse, setQueHizoParaRegularse] = useState('')
  const [sigueActivo, setSigueActivo] = useState(true)
  const [duracionEstimada, setDuracionEstimada] = useState('')

  const handleContinue = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await saveBrote({
      zona_corporal: zonaCorporal,
      intensidad,
      posible_causa: posibleCausa,
      que_paso_antes: quePasoAntes,
      que_hizo_para_regularse: queHizoParaRegularse,
      sigue_activo: sigueActivo,
      duracion_estimada: duracionEstimada,
    })

    if (result?.error) {
      toast.error('Algo salió mal. Intentá de nuevo.')
    } else {
      toast.success('Registro guardado. Estamos contigo.')
      router.push('/inicio')
    }
    setSaving(false)
  }

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden flex justify-between items-center px-container-padding-mobile py-6">
        <h1 className="font-serif text-xl italic text-[#8E354A] dark:text-rose-300 font-extrabold tracking-tight">
          Sanctuary
        </h1>
        <button
          onClick={() => router.push('/inicio')}
          className="text-[#8E354A] hover:opacity-80 transition-opacity touch-manipulation"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="flex-grow px-container-padding-mobile md:px-container-padding-desktop py-12 md:py-section-gap flex flex-col justify-center items-start max-w-3xl mx-auto w-full relative pb-32 md:pb-section-gap">

        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full px-container-padding-mobile md:px-container-padding-desktop pt-2 md:pt-8">
          <div className="w-full h-[2px] bg-[#f0dee0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8e354a] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-on-surface-variant mt-stack-sm opacity-60">
            Paso {step} de 3
          </p>
        </div>

        <div className="w-full mt-12 md:mt-0">

          {/* ─── STEP 1: ¿Cómo estás ahora? ─────────────────────────────── */}
          {step === 1 && (
            <>
              <h2 className="font-serif text-[40px] leading-[48px] tracking-[-0.02em] text-on-background mb-stack-lg">
                ¿Dónde sientes el dolor ahora?
              </h2>
              <p className="text-[18px] leading-[28px] text-on-surface-variant mb-section-gap max-w-xl">
                Tómate un momento. No hay prisa. Identifica la sensación en tu cuerpo.
              </p>

              {/* Zona corporal */}
              <div className="w-full max-w-xl mb-section-gap">
                <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-on-surface-variant block mb-stack-sm" htmlFor="pain-location">
                  Ubicación o sensación
                </label>
                <input
                  className="w-full bg-transparent border-0 border-b-[0.5px] border-outline-variant focus:border-[#8e354a] focus:ring-0 px-0 py-3 text-[18px] leading-[28px] text-on-background placeholder:text-outline-variant/50 transition-colors touch-manipulation"
                  id="pain-location"
                  placeholder="Ej. Presión en el pecho, tensión en el cuello..."
                  type="text"
                  value={zonaCorporal}
                  onChange={(e) => setZonaCorporal(e.target.value)}
                />
              </div>

              {/* Intensidad */}
              <div className="w-full max-w-xl mb-section-gap">
                <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-on-surface-variant block mb-stack-md">
                  Intensidad del brote
                </label>
                <div className="flex gap-stack-sm">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setIntensidad(val)}
                      className={`flex-1 py-3 rounded-lg border-[0.5px] text-[18px] font-semibold transition-all touch-manipulation ${
                        intensidad === val
                          ? 'border-[#8e354a] text-white bg-[#8e354a] shadow-md scale-105'
                          : 'border-outline-variant text-on-surface-variant hover:bg-surface'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-stack-sm">
                  <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-outline">Leve</span>
                  <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-outline">Severo</span>
                </div>
              </div>

              {/* Continue */}
              <div className="flex items-center gap-stack-md">
                <button
                  onClick={handleContinue}
                  className="bg-[#8e354a] text-white text-[15px] font-medium px-8 py-3 rounded-lg hover:opacity-90 transition-opacity touch-manipulation"
                >
                  Continuar
                </button>
              </div>
            </>
          )}

          {/* ─── STEP 2: ¿Qué lo desencadenó? ────────────────────────────── */}
          {step === 2 && (
            <>
              <h2 className="font-serif text-[40px] leading-[48px] tracking-[-0.02em] text-on-background mb-stack-lg">
                ¿Qué lo desencadenó?
              </h2>
              <p className="text-[18px] leading-[28px] text-on-surface-variant mb-section-gap max-w-xl">
                No necesitás tener certeza. Escribí lo que se te ocurra, cualquier pista ayuda.
              </p>

              {/* Posible causa */}
              <div className="w-full max-w-xl mb-section-gap">
                <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-on-surface-variant block mb-stack-sm" htmlFor="posible-causa">
                  ¿Qué creés que causó el brote?
                </label>
                <input
                  className="w-full bg-transparent border-0 border-b-[0.5px] border-outline-variant focus:border-[#8e354a] focus:ring-0 px-0 py-3 text-[18px] leading-[28px] text-on-background placeholder:text-outline-variant/50 transition-colors touch-manipulation"
                  id="posible-causa"
                  placeholder="Ej. Una discusión, estrés laboral, clima..."
                  type="text"
                  value={posibleCausa}
                  onChange={(e) => setPosibleCausa(e.target.value)}
                />
              </div>

              {/* Qué pasó antes */}
              <div className="w-full max-w-xl mb-section-gap">
                <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-on-surface-variant block mb-stack-sm" htmlFor="que-paso-antes">
                  ¿Qué estaba pasando antes?
                </label>
                <input
                  className="w-full bg-transparent border-0 border-b-[0.5px] border-outline-variant focus:border-[#8e354a] focus:ring-0 px-0 py-3 text-[18px] leading-[28px] text-on-background placeholder:text-outline-variant/50 transition-colors touch-manipulation"
                  id="que-paso-antes"
                  placeholder="Ej. Estaba en el trabajo, no dormí bien..."
                  type="text"
                  value={quePasoAntes}
                  onChange={(e) => setQuePasoAntes(e.target.value)}
                />
              </div>

              {/* Nav buttons */}
              <div className="flex items-center gap-stack-md">
                <button
                  onClick={handleBack}
                  className="text-on-surface-variant text-[15px] font-medium px-6 py-3 rounded-lg border-[0.5px] border-outline-variant hover:bg-surface transition-colors touch-manipulation"
                >
                  Atrás
                </button>
                <button
                  onClick={handleContinue}
                  className="bg-[#8e354a] text-white text-[15px] font-medium px-8 py-3 rounded-lg hover:opacity-90 transition-opacity touch-manipulation"
                >
                  Continuar
                </button>
              </div>
            </>
          )}

          {/* ─── STEP 3: ¿Cómo estás respondiendo? ───────────────────────── */}
          {step === 3 && (
            <>
              <h2 className="font-serif text-[40px] leading-[48px] tracking-[-0.02em] text-on-background mb-stack-lg">
                ¿Cómo estás respondiendo?
              </h2>
              <p className="text-[18px] leading-[28px] text-on-surface-variant mb-section-gap max-w-xl">
                Registrar cómo respondés es tan importante como registrar el dolor.
              </p>

              {/* Qué hiciste para regularte */}
              <div className="w-full max-w-xl mb-section-gap">
                <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-on-surface-variant block mb-stack-sm" htmlFor="regulacion">
                  ¿Qué hiciste para regularte?
                </label>
                <input
                  className="w-full bg-transparent border-0 border-b-[0.5px] border-outline-variant focus:border-[#8e354a] focus:ring-0 px-0 py-3 text-[18px] leading-[28px] text-on-background placeholder:text-outline-variant/50 transition-colors touch-manipulation"
                  id="regulacion"
                  placeholder="Ej. Respiración, caminata, medicación..."
                  type="text"
                  value={queHizoParaRegularse}
                  onChange={(e) => setQueHizoParaRegularse(e.target.value)}
                />
              </div>

              {/* ¿Sigue activo? */}
              <div className="w-full max-w-xl mb-section-gap">
                <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-on-surface-variant block mb-stack-md">
                  ¿El brote sigue activo?
                </label>
                <div className="bg-surface-variant/30 p-1.5 rounded-full flex items-center w-fit">
                  <button
                    type="button"
                    onClick={() => setSigueActivo(true)}
                    className={`px-8 py-3 rounded-full text-[15px] font-semibold transition-all duration-300 touch-manipulation ${
                      sigueActivo
                        ? 'bg-[#8e354a] text-white shadow-md scale-105'
                        : 'text-outline hover:text-on-surface-variant'
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setSigueActivo(false)}
                    className={`px-8 py-3 rounded-full text-[15px] font-semibold transition-all duration-300 touch-manipulation ${
                      !sigueActivo
                        ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                        : 'text-outline hover:text-on-surface-variant'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Duración estimada */}
              <div className="w-full max-w-xl mb-section-gap">
                <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-on-surface-variant block mb-stack-sm" htmlFor="duracion">
                  Duración estimada (opcional)
                </label>
                <input
                  className="w-full bg-transparent border-0 border-b-[0.5px] border-outline-variant focus:border-[#8e354a] focus:ring-0 px-0 py-3 text-[18px] leading-[28px] text-on-background placeholder:text-outline-variant/50 transition-colors touch-manipulation"
                  id="duracion"
                  placeholder="Ej. 30 minutos, 2 horas, todo el día..."
                  type="text"
                  value={duracionEstimada}
                  onChange={(e) => setDuracionEstimada(e.target.value)}
                />
              </div>

              {/* Nav buttons */}
              <div className="flex items-center gap-stack-md">
                <button
                  onClick={handleBack}
                  className="text-on-surface-variant text-[15px] font-medium px-6 py-3 rounded-lg border-[0.5px] border-outline-variant hover:bg-surface transition-colors touch-manipulation"
                >
                  Atrás
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#8e354a] text-white text-[15px] font-medium px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 touch-manipulation"
                >
                  {saving ? 'Guardando...' : 'Guardar mi registro'}
                  {!saving && <span className="material-symbols-outlined text-[18px]">check</span>}
                </button>
              </div>
            </>
          )}

        </div>
      </main>
    </>
  )
}
