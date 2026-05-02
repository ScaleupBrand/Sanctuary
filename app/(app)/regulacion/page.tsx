'use client'

import { useState } from 'react'
import { saveSessionPrep } from '@/lib/actions/regulacion'

export default function RegulacionPage() {
  const [tema, setTema] = useState('')
  const [emocion, setEmocion] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSavePrep = async () => {
    if (!tema.trim() && !emocion.trim()) return
    setSaving(true)
    const result = await saveSessionPrep({
      tema_principal: tema,
      emocion_dominante: emocion,
    })
    setSaving(false)
    if (result.success) {
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setTema('')
        setEmocion('')
      }, 2000)
    } else {
      alert(result.error)
    }
  }

  return (
    <main className="flex-grow md:pt-8 pb-32 px-container-padding-mobile md:px-container-padding-desktop max-w-3xl mx-auto w-full space-y-section-gap">
      
      <div className="pt-8">
        <h1 className="font-serif text-[40px] leading-[48px] tracking-[-0.02em] text-on-background mb-stack-sm">
          Regulación
        </h1>
        <p className="text-[18px] leading-[28px] text-on-surface-variant max-w-lg">
          Herramientas para devolverle la calma a tu sistema nervioso.
        </p>
      </div>

      {/* Emergency Protocol */}
      <section className="bg-primary text-on-primary rounded-xl p-6 md:p-8 flex flex-col gap-stack-md relative overflow-hidden shadow-[0_12px_24px_rgba(112,30,52,0.05)]">
        <div className="absolute -top-10 -right-10 opacity-20 pointer-events-none">
          <span className="material-symbols-outlined text-[200px]" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
        </div>
        <div className="flex items-center gap-stack-sm relative z-10">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
          <h2 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em]">Protocolo de Emergencia</h2>
        </div>
        <p className="text-[18px] leading-[28px] opacity-90 relative z-10 max-w-lg">
          Técnicas de anclaje rápido para reducir la hiperactividad del sistema nervioso.
        </p>
        <button className="mt-4 self-start bg-on-primary text-primary px-6 py-3 rounded-lg text-[15px] font-medium hover:bg-surface-container-lowest transition-colors shadow-sm touch-manipulation">
          Iniciar Asistencia
        </button>
      </section>

      {/* Relief Practices Gallery */}
      <section className="space-y-stack-lg">
        <h2 className="font-serif text-[32px] leading-[40px] tracking-[-0.01em] text-on-surface">Prácticas de Alivio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
          {/* Card: Breathing */}
          <button className="bg-surface-container-lowest border-[0.5px] border-outline-variant rounded-xl p-6 flex flex-col items-start gap-stack-sm text-left hover:bg-surface-container-low transition-colors shadow-[0_4px_24px_rgba(142,53,74,0.02)] group touch-manipulation relative">
            <div className="w-full flex justify-between items-start mb-2">
              <div className="h-12 w-12 rounded-full bg-surface-container-low flex items-center justify-center group-hover:bg-primary-fixed transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl">air</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">north_east</span>
            </div>
            <h3 className="font-serif text-2xl text-on-surface">Respiración</h3>
            <p className="text-[16px] leading-[24px] text-on-surface-variant">Ejercicios guiados para regular el ritmo cardíaco y encontrar la calma.</p>
          </button>
          
          {/* Card: Grounding */}
          <button className="bg-surface-container-lowest border-[0.5px] border-outline-variant rounded-xl p-6 flex flex-col items-start gap-stack-sm text-left hover:bg-surface-container-low transition-colors shadow-[0_4px_24px_rgba(142,53,74,0.02)] group touch-manipulation relative">
            <div className="w-full flex justify-between items-start mb-2">
              <div className="h-12 w-12 rounded-full bg-surface-container-low flex items-center justify-center group-hover:bg-primary-fixed transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl">nature_people</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">north_east</span>
            </div>
            <h3 className="font-serif text-2xl text-on-surface">Enraizamiento</h3>
            <p className="text-[16px] leading-[24px] text-on-surface-variant">Técnicas sensoriales para reconectar con el entorno presente.</p>
          </button>
          
          {/* Card: Movement (Full Width span) */}
          <button className="bg-surface-container-lowest border-[0.5px] border-outline-variant rounded-xl p-6 flex flex-col items-start gap-stack-sm text-left hover:bg-surface-container-low transition-colors md:col-span-2 shadow-[0_4px_24px_rgba(142,53,74,0.02)] group touch-manipulation relative">
            <div className="w-full flex justify-between items-start mb-2">
              <div className="h-12 w-12 rounded-full bg-surface-container-low flex items-center justify-center group-hover:bg-primary-fixed transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl">directions_run</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">north_east</span>
            </div>
            <h3 className="font-serif text-2xl text-on-surface">Movimiento Somático</h3>
            <p className="text-[16px] leading-[24px] text-on-surface-variant">Liberación de tensión acumulada a través de movimientos suaves e intencionales.</p>
          </button>
        </div>
      </section>

      {/* Session Prep */}
      <section className="space-y-stack-lg">
        <h2 className="font-serif text-[32px] leading-[40px] tracking-[-0.01em] text-on-surface">Preparación de Sesión</h2>
        <div className="bg-surface-container-lowest border-[0.5px] border-outline-variant rounded-xl p-6 md:p-8 shadow-[0_4px_24px_rgba(142,53,74,0.02)] space-y-stack-md">
          <p className="text-[16px] leading-[24px] text-on-surface-variant">Organiza tus pensamientos y emociones antes de tu próxima cita para aprovechar el tiempo al máximo.</p>
          <div className="space-y-6 pt-4">
            <div className="relative border-b-[0.5px] border-outline-variant focus-within:border-primary transition-colors">
              <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-primary block mb-2">Tema Principal</label>
              <input 
                className="w-full bg-transparent border-none focus:ring-0 p-0 pb-2 text-[18px] leading-[28px] text-on-surface placeholder:text-outline-variant touch-manipulation focus:outline-none" 
                placeholder="¿De qué necesitas hablar hoy?" 
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
              />
            </div>
            <div className="relative border-b-[0.5px] border-outline-variant focus-within:border-primary transition-colors">
              <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-primary block mb-2">Emoción Dominante</label>
              <input 
                className="w-full bg-transparent border-none focus:ring-0 p-0 pb-2 text-[18px] leading-[28px] text-on-surface placeholder:text-outline-variant touch-manipulation focus:outline-none" 
                placeholder="Identifica cómo te has sentido..." 
                type="text"
                value={emocion}
                onChange={(e) => setEmocion(e.target.value)}
              />
            </div>
            
            <button 
              onClick={handleSavePrep}
              disabled={saving || (!tema.trim() && !emocion.trim())}
              className="w-full md:w-auto bg-[#8e354a] text-white px-8 py-3 rounded-lg text-[15px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 touch-manipulation"
            >
              {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar Preparación'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
