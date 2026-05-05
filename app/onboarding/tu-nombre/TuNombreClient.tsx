'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateNombre, updateAvatar } from '@/lib/actions/ajustes'

export default function TuNombreClient({ initialData }: { initialData: { nombre: string, avatarUrl: string | null } }) {
  const [nombre, setNombre] = useState(initialData.nombre)
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl)
  const [uploading, setUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

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
    } else {
      toast.error(res.error || 'Algo salió mal. Intentá de nuevo.')
    }
  }

  const handleSiguiente = async () => {
    setIsSaving(true)
    if (nombre !== initialData.nombre) {
      await updateNombre(nombre)
    }
    router.push('/onboarding/tu-horario')
  }

  return (
    <>
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-opacity-90 backdrop-blur-md bg-[#FAF7F2] dark:bg-stone-950 border-b-[0.5px] border-rose-100 dark:border-stone-800">
        <Link href="/onboarding/como-funciona" aria-label="Volver" className="flex items-center text-[#8E354A] dark:text-rose-400 hover:opacity-70 transition-opacity duration-300 active:scale-95">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
        </Link>
        <div className="font-serif text-[#8E354A] dark:text-rose-300 antialiased font-medium">
          3 de 4
        </div>
        <Link href="/onboarding/tu-horario" className="font-serif text-[#8E354A] dark:text-rose-300 antialiased font-medium hover:opacity-70 transition-opacity duration-300 active:scale-95">
          Saltar
        </Link>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col pt-[80px] px-container-padding-mobile md:px-container-padding-desktop min-h-screen">
        <div className="w-full max-w-xl mx-auto flex flex-col gap-section-gap py-section-gap h-full flex-grow">
          
          {/* Avatar Upload Section */}
          <section aria-label="Foto de perfil" className="flex flex-col items-start gap-stack-md">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Subir foto de perfil" 
              className="relative w-24 h-24 rounded-full bg-surface-variant border-[0.5px] border-outline-variant flex items-center justify-center overflow-hidden transition-colors hover:bg-surface-container-highest group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" 
              type="button"
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Tu foto de perfil" layout="fill" objectFit="cover" />
              ) : (
                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors text-[32px]" style={{ fontVariationSettings: "'FILL' 0" }}>upload</span>
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
          </section>

          {/* Typography & Intent Section */}
          <section className="flex flex-col gap-stack-sm text-left">
            <h1 className="font-display-serif text-display-serif text-on-surface">
              ¿Cómo querés que te llamemos?
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
              Así es como te saludaremos cada día.
            </p>
          </section>

          {/* Input Section */}
          <section className="flex flex-col gap-stack-sm pt-stack-md w-full max-w-md">
            <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="user-name">
              Nombre
            </label>
            <div className="relative w-full">
              <input 
                id="user-name" 
                name="user-name" 
                placeholder="Tu nombre" 
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="given-name" 
                className="w-full bg-transparent border-0 border-b-[0.5px] border-outline-variant text-on-surface font-body-lg text-body-lg py-stack-sm px-0 focus:ring-0 focus:border-primary transition-colors placeholder:text-outline-variant/50" 
              />
            </div>
          </section>

          {/* Spacer */}
          <div className="flex-grow"></div>

          {/* CTA Section */}
          <section className="w-full pb-container-padding-mobile pt-stack-lg max-w-md">
            <button 
              onClick={handleSiguiente}
              disabled={isSaving || !nombre.trim()}
              className="w-full bg-primary text-on-primary font-button-text text-button-text py-[14px] px-6 rounded-full transition-colors hover:bg-primary-container active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                  Guardando...
                </>
              ) : (
                'Siguiente'
              )}
            </button>
          </section>
        </div>
      </main>
    </>
  )
}
