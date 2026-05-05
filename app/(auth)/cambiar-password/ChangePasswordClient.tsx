'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function ChangePasswordClient() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.')
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)

    if (error) {
      toast.error('Algo salió mal. Intentá de nuevo.')
      return
    }

    toast.success('Contraseña actualizada.')
    router.push('/login')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-container-padding-mobile py-12 text-on-background">
      <section className="w-full max-w-md rounded-[24px] border border-outline-variant bg-surface-container-lowest p-8 shadow-[0_12px_32px_rgba(142,53,74,0.08)]">
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-outline">Sanctuary</p>
        <h1 className="mb-3 font-serif text-[32px] leading-[40px] tracking-[-0.01em] text-primary">Nueva contraseña</h1>
        <p className="mb-8 text-[16px] leading-[24px] text-on-surface-variant">
          Escribí una contraseña nueva para volver a entrar con seguridad.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Contraseña</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              minLength={8}
              required
              className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-3 text-[16px] text-on-surface focus:border-primary focus:ring-0"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">Repetir contraseña</span>
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              minLength={8}
              required
              className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-3 text-[16px] text-on-surface focus:border-primary focus:ring-0"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center rounded-full bg-primary py-4 text-[15px] font-medium text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>

        <Link href="/login" className="mt-6 inline-flex text-sm font-semibold text-primary transition-opacity hover:opacity-70">
          Volver a iniciar sesión
        </Link>
      </section>
    </main>
  )
}
