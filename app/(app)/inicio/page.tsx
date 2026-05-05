'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { saveCheckin, saveSessionNotes } from '@/lib/actions/checkin-status'
import { useCheckin, type WeeklyDay } from '@/components/providers/CheckinProvider'

// ─── Energy color for weekly dots ────────────────────────────────────────────
const energyColor = (d: WeeklyDay) => {
  if (!d.registered || !d.energia) return 'border-[#cfc8c5] bg-[#e8e4e0]'
  if (d.energia >= 4) return 'border-[#8bc99a] bg-[#dff4e3]'
  if (d.energia >= 2) return 'border-[#f2c84b] bg-[#fff4ca]'
  return 'border-[#f0a39d] bg-[#ffe0dd]'
}

const currentDayMarkerColor = (d: WeeklyDay) => {
  if (!d.registered || !d.energia) return 'bg-[#5f5754]'
  if (d.energia >= 4) return 'bg-[#4f9d61]'
  if (d.energia >= 2) return 'bg-[#c79718]'
  return 'bg-[#d05f56]'
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

const greetingName = (name: string | null) => {
  if (!name?.trim()) return ''
  return `, ${name.trim().split(' ')[0]}`
}

const weeklyEnergyLabel = (history: WeeklyDay[]) => {
  const values = history
    .filter((d) => d.registered && typeof d.energia === 'number')
    .map((d) => d.energia as number)

  if (values.length === 0) return 'Sin registro'

  const avg = values.reduce((sum, value) => sum + value, 0) / values.length

  if (avg >= 3) return 'Estable'
  if (avg >= 2) return 'Baja'
  return 'Muy baja'
}

const formatUpcomingSessionDate = (value: string) =>
  new Date(value).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

const isWithinNextThreeDays = (value: string) => {
  const sessionTime = new Date(value).getTime()
  const now = Date.now()
  const threeDays = 1000 * 60 * 60 * 24 * 3

  return sessionTime >= now && sessionTime <= now + threeDays
}

function WeeklySummaryCard({
  weeklyHistory,
  clinicalDate,
}: {
  weeklyHistory: WeeklyDay[]
  clinicalDate: string | null
}) {
  const registeredDays = weeklyHistory.filter((d) => d.registered).length
  const flareDays = weeklyHistory.filter((d) => d.huboBrote).length
  const energy = weeklyEnergyLabel(weeklyHistory)

  return (
    <section className="mb-section-gap">
      <p className="mb-stack-sm text-[12px] font-semibold tracking-[0.14em] uppercase text-outline">
        Tu semana
      </p>
      <div className="rounded-xl border-[0.5px] border-outline-variant bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(142,53,74,0.04)]">
        <div className="grid grid-cols-7 gap-2">
          {weeklyHistory.map((d) => (
            <div key={d.fecha} className="flex flex-col items-center gap-3">
              <span className="text-[12px] font-semibold tracking-[0.12em] uppercase text-outline">
                {d.dayLabel.slice(0, 1)}
              </span>
              <span
                className={`relative size-8 rounded-full border-2 ${energyColor(d)}`}
                title={d.registered ? `Energía: ${d.energia}` : 'No registrado'}
              >
                {d.fecha === clinicalDate && (
                  <span className={`absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${currentDayMarkerColor(d)}`} />
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="my-5 h-[0.5px] bg-outline-variant/60" />
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined mt-0.5 text-[22px] text-[#8e354a]">insights</span>
          <p className="text-[18px] leading-[28px] text-on-surface-variant">
            {registeredDays} días registrados · {flareDays} brotes · Energía: {energy}
          </p>
        </div>
      </div>
    </section>
  )
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
      toast.success('Cambios guardados')
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setNotes('')
        onClose()
      }, 1200)
    } else {
      toast.error('Algo salió mal. Intentá de nuevo.')
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
  const { requestNavigation, clinicalDate, todayCheckin, weeklyHistory, userName, upcomingSession, setPending } = useCheckin()
  const [sessionModalOpen, setSessionModalOpen] = useState(false)
  const shouldPrepareSession = Boolean(upcomingSession && isWithinNextThreeDays(upcomingSession.fecha_hora))

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
            Buen día{greetingName(userName)}.
          </h1>
        </section>

        {/* Daily summary */}
        <section className="mb-stack-lg">
          <p className="font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-background max-w-lg">
            Hoy te sientes {energyLabel(todayCheckin?.energia)}. Sigue escuchando a tu cuerpo.
          </p>
        </section>

        <WeeklySummaryCard weeklyHistory={weeklyHistory} clinicalDate={clinicalDate} />

        {upcomingSession && (
          <section className="mb-section-gap rounded-xl border-[0.5px] border-outline-variant bg-surface-container-lowest p-6 shadow-[0_8px_24px_rgba(142,53,74,0.04)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${shouldPrepareSession ? 'bg-primary text-on-primary' : 'bg-primary-fixed text-primary'}`}>
                  <span className="material-symbols-outlined">event</span>
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-outline">Próxima sesión</p>
                  <h2 className="mt-1 font-serif text-[24px] leading-[32px] tracking-[-0.01em] text-on-background">
                    {formatUpcomingSessionDate(upcomingSession.fecha_hora)}
                  </h2>
                  {shouldPrepareSession && (
                    <p className="mt-1 text-[15px] leading-[22px] text-on-surface-variant">
                      Ya podés preparar lo que querés llevar a sesión.
                    </p>
                  )}
                </div>
              </div>

              {shouldPrepareSession && (
                <button
                  type="button"
                  onClick={() => setSessionModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-surface-tint"
                >
                  Preparar mi sesión
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              )}
            </div>
          </section>
        )}

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
            className={`group text-left md:col-span-2 rounded-xl p-6 border-[0.5px] border-outline-variant shadow-[0_4px_24px_rgba(142,53,74,0.03)] transition-colors touch-manipulation ${
              shouldPrepareSession ? 'bg-primary text-on-primary hover:bg-surface-tint' : 'bg-[#f0dee0] hover:bg-surface-variant'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#701e34]">calendar_today</span>
                </div>
                <div>
                  <h3 className={`font-serif text-[24px] leading-[32px] tracking-[-0.01em] ${shouldPrepareSession ? 'text-on-primary' : 'text-on-background'}`}>Preparación para Sesión</h3>
                  <p className={`text-[16px] leading-[24px] ${shouldPrepareSession ? 'text-primary-fixed-dim' : 'text-on-surface-variant'}`}>
                    {upcomingSession
                      ? `Próxima sesión: ${formatUpcomingSessionDate(upcomingSession.fecha_hora)}`
                      : 'Notas y temas para tu próxima terapia.'}
                  </p>
                </div>
              </div>
              <span className={`text-[15px] font-medium px-4 py-2 rounded-full flex items-center gap-2 w-fit ${
                shouldPrepareSession ? 'bg-on-primary text-primary' : 'bg-[#8e354a] text-white'
              }`}>
                {shouldPrepareSession ? 'Preparar mi sesión' : 'Escribir'}
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
  const { isPending, clinicalDate, userName, setPending, todayCheckin, setTodayCheckin, setWeeklyHistory } = useCheckin()

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
      toast.error('Algo salió mal. Intentá de nuevo.')
    } else {
      toast.success('Tu registro de hoy está guardado')
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
      if (clinicalDate) {
        setWeeklyHistory((current) =>
          current.map((day) =>
            day.fecha === clinicalDate
              ? {
                  ...day,
                  energia,
                  dolor,
                  huboBrote,
                  registered: true,
                }
              : day
          )
        )
      }
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
          Buen día{greetingName(userName)}.
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
