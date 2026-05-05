'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { saveSessionPrep } from '@/lib/actions/regulacion'

export function SessionPrepForm() {
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
      toast.success('Cambios guardados')
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setTema('')
        setEmocion('')
      }, 2000)
    } else {
      toast.error('error' in result ? result.error : 'Algo salió mal. Intentá de nuevo.')
    }
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="relative border-b-[0.5px] border-outline-variant transition-colors focus-within:border-primary">
        <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-primary">Tema Principal</label>
        <input
          className="w-full touch-manipulation border-none bg-transparent p-0 pb-2 text-[18px] leading-[28px] text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-0"
          placeholder="¿De qué necesitas hablar hoy?"
          type="text"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
        />
      </div>
      <div className="relative border-b-[0.5px] border-outline-variant transition-colors focus-within:border-primary">
        <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-primary">Emoción Dominante</label>
        <input
          className="w-full touch-manipulation border-none bg-transparent p-0 pb-2 text-[18px] leading-[28px] text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-0"
          placeholder="Identifica cómo te has sentido..."
          type="text"
          value={emocion}
          onChange={(e) => setEmocion(e.target.value)}
        />
      </div>

      <button
        onClick={handleSavePrep}
        disabled={saving || (!tema.trim() && !emocion.trim())}
        className="w-full touch-manipulation rounded-lg bg-[#8e354a] px-8 py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 md:w-auto"
      >
        {saved ? 'Guardado' : saving ? 'Guardando...' : 'Guardar Preparación'}
      </button>
    </div>
  )
}
