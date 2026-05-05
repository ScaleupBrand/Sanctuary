'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateNombre, updateHoraCheckin, updateNotificaciones, updateAvatar } from '@/lib/actions/ajustes'

type AjustesData = {
  nombre: string
  horaCheckin: string
  notificacionesActivas: boolean
  avatarUrl: string | null
}

export default function AjustesClient({ initialData }: { initialData: AjustesData }) {
  const [nombre, setNombre] = useState(initialData.nombre || '')
  const [horaCheckin, setHoraCheckin] = useState(initialData.horaCheckin || '20:00')
  const [notificaciones, setNotificaciones] = useState(initialData.notificacionesActivas)
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    setUploading(true)
    const formData = new FormData()
    formData.append('avatar', file)
    
    const res = await updateAvatar(formData)
    setUploading(false)
    
    if (res.success && res.avatarUrl) {
      setAvatarUrl(res.avatarUrl)
      toast.success('Cambios guardados')
    } else {
      toast.error('Algo salió mal. Intentá de nuevo.')
    }
  }

  const handleNombreBlur = async () => {
    if (nombre !== initialData.nombre) {
      const res = await updateNombre(nombre)
      if (res.success) {
        toast.success('Cambios guardados')
      } else {
        toast.error('Algo salió mal. Intentá de nuevo.')
      }
    }
  }

  const handleHoraChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHora = e.target.value
    setHoraCheckin(newHora)
    const res = await updateHoraCheckin(newHora)
    if (res.success) {
      toast.success('Cambios guardados')
    } else {
      toast.error('Algo salió mal. Intentá de nuevo.')
    }
  }

  const handleNotificacionesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setNotificaciones(checked)
    const res = await updateNotificaciones(checked)
    if (res.success) {
      toast.success('Cambios guardados')
    } else {
      toast.error('Algo salió mal. Intentá de nuevo.')
    }
  }

  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || ''
  const supportWhatsapp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/\D/g, '') || ''

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pt-20 md:pt-8 pb-16 antialiased">
      {/* TopAppBar (Back button only - Mobile Only) */}
      <header className="md:hidden bg-[#FAF9F6] dark:bg-stone-950 fixed top-0 left-0 right-0 z-50 border-b-[0.5px] border-[#D4A5A5]/40 shadow-[0_4px_20px_-10px_rgba(142,53,74,0.05)]">
        <div className="flex flex-row items-center justify-between px-6 h-20 w-full max-w-screen-xl mx-auto">
          <Link href="/inicio" className="w-10 h-10 flex items-center justify-center rounded-full active:scale-[0.98] transition-transform duration-200 ease-out hover:bg-[#8E354A]/5 dark:hover:bg-[#D4A5A5]/10 transition-colors duration-300">
            <span className="material-symbols-outlined text-[#8E354A] dark:text-[#D4A5A5] font-semibold" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
          </Link>
          <h1 className="font-serif text-center tracking-tight italic text-xl font-medium text-[#8E354A] dark:text-[#D4A5A5]">Ajustes</h1>
          <div className="w-10 h-10"></div> {/* Placeholder for balance */}
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-container-padding-mobile md:px-container-padding-desktop">
        {/* Profile Section */}
        <section className="mt-stack-lg mb-section-gap flex flex-col items-center">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 rounded-full overflow-hidden mb-stack-lg relative group border-[0.5px] border-outline-variant shadow-[0_12px_24px_-4px_rgba(142,53,74,0.05)]"
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Foto de perfil" layout="fill" objectFit="cover" />
            ) : (
              <div className="w-full h-full bg-surface-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-[56px] text-outline">person</span>
              </div>
            )}
            <div className={`absolute inset-0 bg-surface-tint/20 flex items-center justify-center transition-opacity duration-300 ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <span className="material-symbols-outlined text-on-primary">
                {uploading ? 'hourglass_empty' : 'edit'}
              </span>
            </div>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            className="hidden" 
          />
          
          <div className="w-full max-w-sm">
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-unit text-left uppercase" htmlFor="nickname">
              ¿Cómo querés que te llamemos?
            </label>
            <input 
              id="nickname" 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onBlur={handleNombreBlur}
              className="w-full bg-transparent border-0 border-b-[0.5px] border-outline-variant text-body-lg font-body-lg text-on-surface focus:ring-0 focus:border-primary-container px-0 py-unit transition-colors duration-300" 
            />
          </div>
        </section>

        {/* Preferences Cards Area */}
        <div className="space-y-stack-lg">
          {/* Check-in Section */}
          <section className="bg-surface-container-lowest border-[0.5px] border-outline-variant rounded-xl p-6 shadow-[0_12px_24px_-4px_rgba(142,53,74,0.03)]">
            <h2 className="font-h2-serif text-h2-serif text-on-surface mb-stack-md text-left">Registro Diario</h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-unit uppercase" htmlFor="checkin-time">Hora de tu registro diario</label>
                <p className="font-body-md text-body-md text-on-surface-variant/70 max-w-xs text-left">Solo te mostraremos el registro a partir de este horario.</p>
              </div>
              <div className="relative">
                <input 
                  id="checkin-time" 
                  type="time" 
                  value={horaCheckin}
                  onChange={handleHoraChange}
                  className="bg-transparent border-[0.5px] border-outline-variant rounded-lg text-body-lg font-body-lg text-on-surface px-4 py-2 focus:ring-0 focus:border-primary-container focus:bg-surface-container transition-all duration-300 appearance-none" 
                />
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="bg-surface-container-lowest border-[0.5px] border-outline-variant rounded-xl p-6 shadow-[0_12px_24px_-4px_rgba(142,53,74,0.03)] flex flex-row items-center justify-between">
            <div>
              <h2 className="font-h2-serif text-h2-serif text-on-surface mb-unit text-left">Recordatorio</h2>
              <p className="font-body-md text-body-md text-on-surface-variant/70 text-left">Recibir una notificación suave diaria.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={notificaciones}
                onChange={handleNotificacionesChange}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-surface-dim peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
            </label>
          </section>

          {/* Support Section */}
          <section className="bg-surface-container-lowest border-[0.5px] border-outline-variant rounded-xl p-6 shadow-[0_12px_24px_-4px_rgba(142,53,74,0.03)]">
            <h2 className="font-h2-serif text-h2-serif text-on-surface mb-stack-md text-left">Soporte y ayuda</h2>
            <div className="space-y-4 mb-stack-md">
              <details className="group border-b-[0.5px] border-outline-variant/50 pb-4">
                <summary className="flex justify-between items-center font-button-text text-button-text text-on-surface cursor-pointer list-none">
                  <span>¿Dónde encuentro mis ejercicios?</span>
                  <span className="transition group-open:rotate-180">
                    <span className="material-symbols-outlined text-outline">expand_more</span>
                  </span>
                </summary>
                <p className="text-on-surface-variant font-body-md text-body-md mt-unit text-left animate-fade-in">
                  En la sección de Regulación (el icono de flor de loto), accesible desde el menú inferior de la aplicación.
                </p>
              </details>
              <details className="group border-b-[0.5px] border-outline-variant/50 pb-4">
                <summary className="flex justify-between items-center font-button-text text-button-text text-on-surface cursor-pointer list-none">
                  <span>¿Cómo edito un registro anterior?</span>
                  <span className="transition group-open:rotate-180">
                    <span className="material-symbols-outlined text-outline">expand_more</span>
                  </span>
                </summary>
                <p className="text-on-surface-variant font-body-md text-body-md mt-unit text-left animate-fade-in">
                  Ve a la pestaña Historial, selecciona el registro diario que deseas modificar y podrás editar la información guardada.
                </p>
              </details>
              <details className="group border-b-[0.5px] border-outline-variant/50 pb-4">
                <summary className="flex justify-between items-center font-button-text text-button-text text-on-surface cursor-pointer list-none">
                  <span>¿Qué hago si tengo un brote?</span>
                  <span className="transition group-open:rotate-180">
                    <span className="material-symbols-outlined text-outline">expand_more</span>
                  </span>
                </summary>
                <p className="text-on-surface-variant font-body-md text-body-md mt-unit text-left animate-fade-in">
                  Presiona el botón del rayo &quot;Brote&quot; en el menú de inicio para iniciar el protocolo de emergencia de inmediato y avisarle a tu terapeuta.
                </p>
              </details>
            </div>
            {(supportEmail || supportWhatsapp) ? (
              <div className="flex flex-col sm:flex-row gap-4 mt-stack-md">
                {supportEmail && (
                  <a href={`mailto:${supportEmail}`} className="flex-1 border-[0.5px] border-outline-variant rounded-lg py-3 px-4 font-button-text text-button-text text-primary-container flex items-center justify-center gap-2 hover:bg-primary-container/5 transition-colors duration-300">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                    Enviar email
                  </a>
                )}
                {supportWhatsapp && (
                  <a href={`https://wa.me/${supportWhatsapp}`} target="_blank" rel="noreferrer" className="flex-1 bg-primary-container rounded-lg py-3 px-4 font-button-text text-button-text text-on-primary flex items-center justify-center gap-2 hover:bg-primary-container/90 transition-colors duration-300">
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                    WhatsApp
                  </a>
                )}
              </div>
            ) : (
              <p className="mt-stack-md rounded-lg bg-surface-container-low px-4 py-3 text-sm leading-6 text-on-surface-variant">
                Tu terapeuta te indicará el canal de soporte disponible.
              </p>
            )}
          </section>
        </div>

        {/* Session */}
        <section className="mt-section-gap mb-stack-lg flex justify-center">
          <button onClick={handleSignOut} className="font-button-text text-button-text text-error/80 hover:text-error transition-colors duration-300 underline decoration-error/30 underline-offset-4">
            Cerrar sesión
          </button>
        </section>
      </main>
    </div>
  )
}
