import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#fcf9f8] px-6 py-16 text-on-surface">
      <section className="w-full max-w-xl rounded-[24px] border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-[0_16px_48px_rgba(112,30,52,0.06)] md:p-12">
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-outline">404</p>
        <h1 className="font-serif text-[40px] leading-[48px] tracking-tight text-primary">Esta página no está disponible</h1>
        <p className="mx-auto mt-4 max-w-md text-[16px] leading-7 text-on-surface-variant">
          El enlace puede haber cambiado o no tenés acceso a esta zona. Volvé a un espacio seguro para continuar.
        </p>
        <Link
          href="/inicio"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-[15px] font-semibold text-on-primary transition-colors hover:bg-surface-tint"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  )
}
