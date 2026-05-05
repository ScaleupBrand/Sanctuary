'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Hourglass, LockKeyhole, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { updateTherapistAvatar, updateTherapistName } from '@/lib/actions/terapeuta-ajustes'

type TherapistSettingsData = {
  nombre: string
  email: string
  avatarUrl: string | null
}

export function TherapistSettingsClient({ initialData }: { initialData: TherapistSettingsData }) {
  const [nombre, setNombre] = useState(initialData.nombre)
  const [savedName, setSavedName] = useState(initialData.nombre)
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl)
  const [uploading, setUploading] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const initials = nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'T'

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('avatar', file)

    const result = await updateTherapistAvatar(formData)
    setUploading(false)

    if (result.success && result.avatarUrl) {
      setAvatarUrl(result.avatarUrl)
      toast.success('Cambios guardados')
    } else {
      toast.error(result.error || 'Algo salió mal. Intentá de nuevo.')
    }

    event.target.value = ''
  }

  const handleNameSave = async () => {
    const cleanName = nombre.trim()
    if (!cleanName || cleanName === savedName) return

    setSavingName(true)
    const result = await updateTherapistName(cleanName)
    setSavingName(false)

    if (result.success) {
      setNombre(cleanName)
      setSavedName(cleanName)
      toast.success('Cambios guardados')
    } else {
      toast.error(result.error || 'Algo salió mal. Intentá de nuevo.')
    }
  }

  const handlePasswordReset = async () => {
    if (!initialData.email) {
      toast.error('No encontramos un email para esta cuenta.')
      return
    }

    setSendingReset(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(initialData.email, {
      redirectTo: `${window.location.origin}/cambiar-password`,
    })
    setSendingReset(false)

    if (error) {
      toast.error('Algo salió mal. Intentá de nuevo.')
      return
    }

    toast.success('Te enviamos un email para cambiar tu contraseña.')
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="space-y-section-gap">
      <header className="relative mb-16">
        <div className="absolute -left-10 top-6 hidden h-px w-8 bg-primary opacity-30 md:block" />
        <h1 className="mb-4 font-h1-serif text-[44px] leading-tight tracking-tight text-on-background">
          Ajustes de
          <br />
          <span className="italic text-primary">tu perfil</span>
        </h1>
        <p className="max-w-xl font-body-md text-[17px] leading-relaxed text-secondary">
          Mantené actualizados tus datos de acceso y la identidad visible dentro del portal.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr]">
        <div className="rounded-[24px] border border-outline-variant/60 bg-surface-container-lowest p-8 shadow-[0_8px_30px_rgba(142,53,74,0.04)]">
          <div className="flex flex-col items-center text-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="group relative mb-6 size-32 overflow-hidden rounded-full border border-[#ead7d7] bg-primary-fixed shadow-[0_16px_32px_rgba(142,53,74,0.08)]"
              aria-label="Cambiar foto de perfil"
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="Foto de perfil" fill className="object-cover" sizes="128px" />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-serif text-3xl text-primary">
                  {initials}
                </span>
              )}
              <span className={`absolute inset-0 flex items-center justify-center bg-primary/35 text-white transition-opacity ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {uploading ? <Hourglass className="size-6" strokeWidth={1.9} /> : <Camera className="size-6" strokeWidth={1.9} />}
              </span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <p className="font-h2-serif text-h2-serif text-on-surface">{savedName}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a68b8b]">Terapeuta</p>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[24px] border border-outline-variant/60 bg-surface-container-lowest p-8 shadow-[0_8px_30px_rgba(142,53,74,0.04)]">
            <div className="mb-8">
              <h2 className="font-h2-serif text-h2-serif text-on-surface">Datos personales</h2>
              <p className="mt-2 text-sm text-on-surface-variant">Estos datos aparecen en el portal interno.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <label htmlFor="therapist-name" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  Nombre completo
                </label>
                <input
                  id="therapist-name"
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  onBlur={handleNameSave}
                  className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-3 font-body-md text-base text-on-surface transition-colors focus:border-primary focus:ring-0"
                />
                <button
                  type="button"
                  onClick={handleNameSave}
                  disabled={savingName || nombre.trim() === savedName}
                  className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {savingName ? 'Guardando...' : 'Guardar nombre'}
                </button>
              </div>

              <div>
                <label htmlFor="therapist-email" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  Email
                </label>
                <input
                  id="therapist-email"
                  value={initialData.email}
                  readOnly
                  className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-3 font-body-md text-base text-on-surface-variant focus:ring-0"
                />
                <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
                  El email está asociado a tu cuenta de acceso y no se modifica desde este panel.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-outline-variant/60 bg-surface-container-low p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-h2-serif text-h2-serif text-on-surface">Seguridad</h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
                  Te enviaremos un enlace seguro al email de esta cuenta para cambiar la contraseña.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={sendingReset}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-white px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LockKeyhole className="size-[18px]" strokeWidth={1.8} />
                {sendingReset ? 'Enviando...' : 'Cambiar contraseña'}
              </button>
            </div>
          </section>

          <section className="rounded-[24px] border border-error-container bg-white p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-h2-serif text-h2-serif text-on-surface">Cerrar sesión</h2>
                <p className="mt-2 text-sm text-on-surface-variant">Salí del portal en este dispositivo.</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <LogOut className="size-[18px]" strokeWidth={1.8} />
                Cerrar sesión
              </button>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
