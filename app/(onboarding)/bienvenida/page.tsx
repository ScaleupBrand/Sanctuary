import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function BienvenidaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let nombre = ''
  if (user) {
    const { data: profile } = await supabase.from('users').select('nombre').eq('id', user.id).single()
    if (profile?.nombre) {
      // Tomamos el primer nombre de la persona
      nombre = profile.nombre.split(' ')[0]
    }
  }

  return (
    <>
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-background/90 backdrop-blur-md border-b-[0.5px] border-outline-variant">
        <div className="w-10 h-10 flex items-center justify-center -ml-2 text-primary opacity-50 cursor-not-allowed">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
        </div>
        <span className="font-button-text text-button-text text-primary font-medium tracking-wide">
          1 of 4
        </span>
        <Link href="/onboarding/como-funciona" className="font-button-text text-button-text text-primary hover:opacity-70 transition-opacity duration-300 active:scale-95 px-2 py-2">
          Skip
        </Link>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col pt-24 pb-8 px-container-padding-mobile md:px-container-padding-desktop max-w-2xl mx-auto w-full min-h-screen">
        {/* Hero Visual */}
        <div className="w-full aspect-[4/5] md:aspect-[16/10] rounded-xl overflow-hidden relative shadow-[0_12px_24px_rgba(112,30,52,0.03)] border border-outline-variant/30">
          <Image 
            src="/foto%20onboarding.jpeg"
            alt="Therapeutic abstract sanctuary" 
            layout="fill"
            objectFit="cover"
            objectPosition="center"
          />
        </div>

        {/* Typography Section */}
        <div className="mt-section-gap flex flex-col">
          <h1 className="font-display-serif text-display-serif text-primary text-left">
            Bienvenida a tu santuario
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-stack-md text-left max-w-[90%]">
            Este es tu espacio{nombre ? `, ${nombre}` : ''}. Un refugio seguro para escuchar a tu cuerpo y caminar hacia la calma.
          </p>
        </div>

        {/* Spacer to push CTA to bottom */}
        <div className="flex-1 mt-section-gap min-h-[40px]"></div>

        {/* Primary CTA */}
        <div className="w-full pb-4">
          <Link href="/onboarding/como-funciona" className="w-full bg-primary text-on-primary py-4 px-6 rounded-full font-button-text text-button-text hover:bg-surface-tint transition-colors duration-300 active:scale-[0.98] shadow-[0_8px_16px_rgba(112,30,52,0.05)] text-center flex justify-center items-center">
            Comenzar
          </Link>
        </div>
      </main>
    </>
  )
}
