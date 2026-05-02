'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { saveCheckin, saveSessionNotes } from '@/lib/actions/checkin-status'
import { useCheckin, type WeeklyDay } from '@/components/providers/CheckinProvider'

// ─── Energy color for weekly dots ────────────────────────────────────────────
const energyColor = (d: WeeklyDay) => {
  if (!d.registered) return 'bg-[#877274]/20' // gray — not registered
  if (d.energia >= 4) return 'bg-emerald-500'  // green
  if (d.energia >= 2) return 'bg-amber-400'     // amber
  return 'bg-rose-500'                           // red
}

// ─── Energy label for summary card ───────────────────────────────────────────
const energyLabel = (val: number | null | undefined) => {
  if (!val || val === 0) return 'sin registrar'
  if (val <= 1) return 'con energía muy baja'
  if (val <= 2) return 'con energía baja'
  if (val <= 3) return 'con energía estable'
  if (val <= 4) return 'con buena energía'
  return 'radiante'
}

// ─── Session Notes Modal ─────────────────────────────────────────────────────
function SessionNotesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!isOpen) return null

  const handleSave = async () => {
    if (!notes.trim()) return
    setSaving(true)
    const res = await saveSessionNotes(notes)
    setSaving(false)
    if (res.success) {
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setNotes('')
        onClose()
      }, 1200)
    }
  }

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }} className="flex items-center justify-center p-6">
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(34,25,26,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div
        style={{ position: 'relative', zIndex: 10000, width: '100%', maxWidth: '480px' }}
        className="bg-[#FAF9F6] dark:bg-stone-950 rounded-3xl p-8 shadow-2xl border border-rose-100 dark:border-stone-800"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-[22px] leading-[30px] text-on-background">
            Notas para tu sesión
          </h2>
          <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors touch-manipulation">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="text-[15px] leading-[22px] text-on-surface-variant mb-4">
          Escribí lo que quieras recordar o hablar en tu próxima sesión de terapia.
        </p>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Temas, preguntas, reflexiones..."
          rows={5}
          className="w-full bg-transparent border-[0.5px] border-outline-variant focus:border-[#701e34] focus:ring-0 rounded-xl px-4 py-3 text-[16px] leading-[26px] text-on-background resize-none placeholder-outline/40 mb-6 touch-manipulation"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full text-[15px] font-semibold bg-stone-100 dark:bg-stone-900 text-on-surface-variant hover:bg-stone-200 transition-colors touch-manipulation"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !notes.trim()}
            className="flex-1 py-3 rounded-full text-[15px] font-semibold bg-[#8E354A] text-white hover:opacity-90 transition-opacity disabled:opacity-50 touch-manipulation"
          >
            {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Home Dashboard (post check-in) ─────────────────────────────────────────
function HomeDashboard() {
  const { requestNavigation, todayCheckin, weeklyHistory, setPending, setTodayCheckin } = useCheckin()
  const [sessionModalOpen, setSessionModalOpen] = useState(false)

  const handleEdit = () => {
    // Go back to check-in form with existing data
    setPending(true)
  }

  return (
    <>
      {/* Daily Status Bar */}
      <div className="fixed top-16 md:top-[73px] left-0 w-full z-40 bg-[#fff0f1] border-b-[0.5px] border-[#dac0c3] py-2 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[#701e34] text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <span className="text-[16px] leading-[24px] text-[#544245]">Tu registro de hoy está listo</span>
        </div>
        <button
          onClick={handleEdit}
          className="text-[15px] font-medium text-[#701e34] hover:opacity-70 transition-opacity touch-manipulation"
        >
          Editar
        </button>
      </div>

      <main className="pt-[104px] md:pt-[120px] px-container-padding-mobile md:px-container-padding-desktop max-w-5xl mx-auto pb-28 md:pb-16">
        {/* Greeting */}
        <section className="mb-stack-lg">
          <h1 className="font-serif text-[40px] leading-[48px] tracking-[-0.02em] text-on-background">
            Buen día, Elena.
          </h1>
        </section>

        {/* Weekly mini-summary */}
        <section className="mb-stack-lg flex items-end gap-2">
          {weeklyHistory.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`w-3 h-3 rounded-full transition-all ${energyColor(d)}`}
                title={d.registered ? `Energía: ${d.energia}` : d.omitido ? 'Omitido' : 'No registrado'}
              />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-outline">{d.day}</span>
            </div>
          ))}
        </section>

        {/* Summary Card with landscape image */}
        <section className="mb-section-gap">
          <div className="relative overflow-hidden rounded-xl border-[0.5px] border-[#dac0c3] bg-[#ffffff] shadow-[0_4px_24px_rgba(142,53,74,0.03)]">
            <div className="absolute inset-0 z-0">
              <Image
                src="/santuario_landscape.png"
                alt="Paisaje sereno al amanecer"
                fill
                className="object-cover opacity-60 blur-[2px]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/40" />
            </div>
            <div className="relative z-10 p-6 md:p-8">
              <p className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-background max-w-lg">
                Hoy te sientes {energyLabel(todayCheckin?.energia)}. Sigue escuchando a tu cuerpo.
              </p>
            </div>
          </div>
        </section>

        {/* Bento Grid — Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-stack-md md:gap-stack-lg">
          {/* Registrar Brote */}
          <button
            type="button"
            onClick={() => requestNavigation('/brote')}
            className="group text-left rounded-xl p-6 bg-surface-container-lowest border-[0.5px] border-outline-variant shadow-[0_4px_24px_rgba(142,53,74,0.03)] hover:border-[#8e354a]/30 transition-colors touch-manipulation"
          >
            <div className="flex items-start justify-between mb-stack-md">
              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center group-hover:bg-[#8e354a]/10 transition-colors">
                <span className="material-symbols-outlined text-[#701e34]">bolt</span>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-[#701e34] transition-colors">arrow_forward</span>
            </div>
            <h3 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-background mb-1">Registrar Brote</h3>
            <p className="text-[16px] leading-[24px] text-on-surface-variant">Documenta tus síntomas y estado actual.</p>
          </button>

          {/* Herramientas de Alivio */}
          <button
            type="button"
            onClick={() => requestNavigation('/regulacion')}
            className="group text-left rounded-xl p-6 bg-surface-container-lowest border-[0.5px] border-outline-variant shadow-[0_4px_24px_rgba(142,53,74,0.03)] hover:border-[#8e354a]/30 transition-colors touch-manipulation"
          >
            <div className="flex items-start justify-between mb-stack-md">
              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center group-hover:bg-[#8e354a]/10 transition-colors">
                <span className="material-symbols-outlined text-[#701e34]">self_care</span>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-[#701e34] transition-colors">arrow_forward</span>
            </div>
            <h3 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-background mb-1">Herramientas de Alivio</h3>
            <p className="text-[16px] leading-[24px] text-on-surface-variant">Ejercicios de regulación y calma.</p>
          </button>

          {/* Preparación para Sesión */}
          <button
            type="button"
            onClick={() => setSessionModalOpen(true)}
            className="group text-left md:col-span-2 rounded-xl p-6 bg-[#f0dee0] border-[0.5px] border-outline-variant shadow-[0_4px_24px_rgba(142,53,74,0.03)] hover:bg-surface-variant transition-colors touch-manipulation"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#701e34]">calendar_today</span>
                </div>
                <div>
                  <h3 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-background">Preparación para Sesión</h3>
                  <p className="text-[16px] leading-[24px] text-on-surface-variant">Notas y temas para tu próxima terapia.</p>
                </div>
              </div>
              <span className="text-[15px] font-medium px-4 py-2 rounded-full bg-[#8e354a] text-white flex items-center gap-2 w-fit">
                Escribir
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </span>
            </div>
          </button>
        </section>
      </main>

      <SessionNotesModal isOpen={sessionModalOpen} onClose={() => setSessionModalOpen(false)} />
    </>
  )
}

// ─── Main Page Component ─────────────────────────────────────────────────────
export default function InicioPage() {
  const { isPending, setPending, todayCheckin, setTodayCheckin } = useCheckin()

  // Initialize form with existing data if editing, else defaults
  const [energia, setEnergia] = useState<number>(todayCheckin?.energia ?? 3)
  const [alerta, setAlerta] = useState<number>(todayCheckin?.alerta_ansiedad ?? 1)
  const [dolor, setDolor] = useState<number>(todayCheckin?.dolor ?? 3)
  const [sueno, setSueno] = useState<string>(todayCheckin?.sueno ?? 'medio')
  const [huboBrote, setHuboBrote] = useState<boolean>(todayCheckin?.hubo_brote ?? false)
  const [nota, setNota] = useState<string>(todayCheckin?.nota_libre ?? '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const result = await saveCheckin({
      energia,
      dolor,
      alerta_ansiedad: alerta,
      sueno,
      hubo_brote: huboBrote,
      nota_libre: nota,
    })

    if (result?.error) {
      alert(result.error)
    } else {
      // Update local state so dashboard shows correct data immediately
      setTodayCheckin({
        energia,
        dolor,
        alerta_ansiedad: alerta,
        sueno,
        hubo_brote: huboBrote,
        nota_libre: nota,
        omitido: false,
      })
      setPending(false)
    }
    setLoading(false)
  }

  if (!isPending) {
    return <HomeDashboard />
  }

  return (
    <main className="max-w-4xl mx-auto px-container-padding-mobile md:px-container-padding-desktop pt-12 md:pt-section-gap">
      {/* Greeting */}
      <section className="mb-section-gap">
        <h1 className="font-serif text-[40px] leading-[48px] tracking-[-0.02em] text-on-background mb-stack-sm">
          Buen día, Elena.
        </h1>
        <p className="text-[18px] leading-[28px] text-on-surface-variant max-w-lg">
          Tómate un momento para registrar cómo te sientes hoy en tu santuario.
        </p>
      </section>

      {/* Daily Check-in Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-stack-md md:gap-stack-lg mb-section-gap">

        {/* 1. Energía Vital (Full) */}
        <div className="md:col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-[0_12px_24px_rgba(142,53,74,0.03)] flex flex-col justify-between">
          <div className="mb-stack-lg">
            <h2 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-background mb-stack-sm">Energía Vital</h2>
            <p className="text-[16px] leading-[24px] text-on-surface-variant">¿Cómo describirías tu nivel de energía en este momento?</p>
          </div>
          <div className="flex flex-wrap gap-stack-sm">
            {[
              { val: 1, label: 'Agotada', icon: 'battery_0_bar' },
              { val: 2, label: 'Baja', icon: 'battery_3_bar' },
              { val: 3, label: 'Estable', icon: 'battery_5_bar' },
              { val: 5, label: 'Radiante', icon: 'battery_full' },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setEnergia(opt.val)}
                className={`px-6 py-3 rounded-full border-[0.5px] transition-colors flex items-center gap-2 text-[15px] font-medium touch-manipulation select-none ${
                  energia === opt.val
                    ? 'border-primary text-primary bg-primary-fixed-dim/20'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Sensación Física (Half) */}
        <div className="md:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-[0_12px_24px_rgba(142,53,74,0.03)] flex flex-col justify-between">
          <div className="mb-stack-lg">
            <h2 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-background mb-stack-sm">Sensación Física</h2>
            <p className="text-[16px] leading-[24px] text-on-surface-variant">Intensidad del malestar físico.</p>
          </div>
          <div className="w-full">
            <input className="w-full h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary touch-manipulation" max="5" min="1" type="range" value={dolor} onChange={(e) => setDolor(parseInt(e.target.value))} />
            <div className="flex justify-between mt-stack-sm">
              <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-outline">Leve</span>
              <span className="text-[12px] font-semibold tracking-[0.1em] uppercase text-outline">Intenso</span>
            </div>
          </div>
        </div>

        {/* 3. Estado Mental / Alerta (Half) */}
        <div className="md:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-[0_12px_24px_rgba(142,53,74,0.03)] flex flex-col justify-between">
          <div className="mb-stack-lg">
            <h2 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-background mb-stack-sm">Estado Mental</h2>
            <p className="text-[16px] leading-[24px] text-on-surface-variant">¿Qué tan activa está tu señal de alerta?</p>
          </div>
          <div className="flex flex-wrap gap-stack-sm">
            {[
              { val: 1, label: 'Tranquila', icon: 'scuba_diving' },
              { val: 2, label: 'Algo tensa', icon: 'compress' },
              { val: 4, label: 'Muy activada', icon: 'bolt' },
              { val: 5, label: 'En alerta máxima', icon: 'emergency' },
            ].map((opt) => (
              <button key={opt.val} type="button" onClick={() => setAlerta(opt.val)}
                className={`px-4 py-2 rounded-full border-[0.5px] transition-colors flex items-center gap-2 text-[13px] font-medium touch-manipulation select-none ${
                  alerta === opt.val ? 'border-primary text-primary bg-primary-fixed-dim/20' : 'border-outline-variant text-on-surface-variant hover:bg-surface'
                }`}
              >
                <span className="material-symbols-outlined text-xs">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Descanso (Full) */}
        <div className="md:col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-[0_12px_24px_rgba(142,53,74,0.03)] flex flex-col justify-between">
          <div className="mb-stack-lg">
            <h2 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-background mb-stack-sm">Descanso</h2>
            <p className="text-[16px] leading-[24px] text-on-surface-variant">Calidad de tu sueño anoche.</p>
          </div>
          <div className="flex flex-wrap gap-stack-sm">
            {[
              { val: 'bien', label: 'Profundo', icon: 'nights_stay' },
              { val: 'medio', label: 'Intermitente', icon: 'bedtime' },
              { val: 'mal', label: 'Insuficiente', icon: 'brightness_3' },
            ].map((opt) => (
              <button key={opt.val} type="button" onClick={() => setSueno(opt.val)}
                className={`px-6 py-3 rounded-full border-[0.5px] transition-colors flex items-center gap-2 text-[15px] font-medium touch-manipulation select-none ${
                  sueno === opt.val ? 'border-primary text-primary bg-primary-fixed-dim/20' : 'border-outline-variant text-on-surface-variant hover:bg-surface'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Flare up Selection Card (Full) */}
        <div className={`md:col-span-12 rounded-2xl p-stack-lg transition-all duration-500 border relative z-10 ${
          huboBrote ? 'bg-primary/5 border-primary/20 shadow-[0_12px_32px_rgba(142,53,74,0.08)]' : 'bg-surface-container-lowest border-outline-variant shadow-[0_8px_20px_rgba(0,0,0,0.02)]'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
            <div>
              <h2 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-background mb-1">¿Tuviste un brote hoy?</h2>
              <p className="text-[16px] leading-[24px] text-on-surface-variant">
                {huboBrote ? "Te acompañamos. Al guardar, registraremos los detalles." : "Si te sientes en crisis o con dolor agudo, márcalo aquí."}
              </p>
            </div>
            <div className="bg-surface-variant/30 p-1.5 rounded-full flex items-center w-fit self-end md:self-center relative z-20">
              <button type="button" onClick={(e) => { e.preventDefault(); setHuboBrote(false); }}
                className={`px-8 py-3 rounded-full text-[15px] font-semibold transition-all duration-300 touch-manipulation ${
                  !huboBrote ? 'bg-surface-container-lowest text-on-surface shadow-sm' : 'text-outline hover:text-on-surface-variant'
                }`}
              >No</button>
              <button type="button" onClick={(e) => { e.preventDefault(); setHuboBrote(true); }}
                className={`px-8 py-3 rounded-full text-[15px] font-semibold transition-all duration-300 touch-manipulation ${
                  huboBrote ? 'bg-primary text-on-primary shadow-md scale-105' : 'text-outline hover:text-on-surface-variant'
                }`}
              >Sí</button>
            </div>
          </div>
        </div>

        {/* 6. Journal Prompt (Full) */}
        <div className="md:col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg shadow-[0_12px_24px_rgba(142,53,74,0.03)]">
          <h2 className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-background mb-stack-lg">Notas del Santuario</h2>
          <div className="relative pt-6">
            <label className="text-[11px] font-semibold tracking-[0.05em] uppercase text-outline/60 absolute top-0 left-0 transition-all" htmlFor="journal">
              Reflexión libre (opcional)
            </label>
            <textarea
              className="w-full bg-transparent border-0 border-b-[0.5px] border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 text-[16px] leading-[26px] text-on-background resize-none placeholder-outline/40 touch-manipulation"
              id="journal" placeholder="Escribe lo que necesites liberar hoy..." rows={4}
              value={nota} onChange={(e) => setNota(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Primary Action */}
      <section className="flex justify-start mb-section-gap">
        <button type="button" onClick={handleSave} disabled={loading}
          className="bg-primary text-on-primary px-8 py-4 rounded-lg text-[15px] font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_4px_12px_rgba(112,30,52,0.15)] disabled:opacity-50 touch-manipulation"
        >
          {loading ? 'Guardando...' : 'Guardar Registro'}
          {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
        </button>
      </section>
    </main>
  )
}
