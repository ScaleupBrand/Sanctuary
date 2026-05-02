import Image from 'next/image'
import Link from 'next/link'
import { signup } from '@/lib/actions/auth'

export default function RegistroPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row w-full bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Left: Atmospheric Image (Desktop Only) */}
      <div className="hidden md:block md:w-1/2 lg:w-[55%] relative overflow-hidden bg-surface-container">
        <Image 
          alt="Serene minimal atmosphere" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCidVDYmlH2thqQig9X1WbN6v70Rta8CIEDfxK2zuwXNBeTH30GvCy-pFS3J_ipRn2-xx2FWpVWskDvHII6tJveOayyeM2XBIM_RGuPJQMJE5eX0YWjIo9F47BN5F72tXRBaNS_TZxEuktCfbZdXUdBck7sG25fwWGm2MBHahVdCkPhD8YDY0RzrtsUrYci32f6ETmTT37rqjSOYEJg7Cu1BwHQf6uyfwCk5XbxMehC_hy_agelDDXKN68Og_yuE6G1t6s7oQrOyW-" 
          fill
          priority
        />
        {/* Subtle gradient overlay for text legibility if needed later, but kept minimal for now */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/10 to-background/40 mix-blend-overlay"></div>
      </div>
      
      {/* Right: Registration Form (The "Journal Page") */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col justify-center min-h-screen px-container-padding-mobile md:px-container-padding-desktop lg:px-[10%] py-12 md:py-24 overflow-y-auto">
        <div className="w-full max-w-[400px] mx-auto md:mx-0 flex flex-col">
          {/* Header Group */}
          <div className="flex flex-col mb-section-gap text-left">
            <span className="text-[12px] font-semibold tracking-[0.1em] text-outline uppercase mb-stack-sm block">
              Volver a Ti
            </span>
            <h1 className="font-serif text-[32px] leading-[40px] tracking-[-0.01em] text-on-surface mb-stack-sm">
              Crea tu cuenta
            </h1>
            <p className="text-[16px] leading-[24px] text-on-surface-variant max-w-[320px]">
              Comienza tu viaje de retorno hacia un espacio de claridad y calma.
            </p>
          </div>
          
          {/* Form */}
          <form action={signup} className="flex flex-col gap-stack-lg w-full">
            {/* Input: Full Name */}
            <div className="flex flex-col gap-stack-sm group">
              <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-on-surface-variant group-focus-within:text-primary transition-colors" htmlFor="fullName">
                Nombre Completo
              </label>
              <input 
                className="w-full bg-transparent border-0 border-b-[0.5px] border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 text-[16px] leading-[24px] text-on-surface transition-colors placeholder-outline/50 shadow-none focus:outline-none" 
                id="fullName" 
                name="fullName" 
                placeholder="Tu nombre" 
                required 
                type="text"
              />
            </div>
            
            {/* Input: Email */}
            <div className="flex flex-col gap-stack-sm group">
              <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-on-surface-variant group-focus-within:text-primary transition-colors" htmlFor="email">
                Correo Electrónico
              </label>
              <input 
                className="w-full bg-transparent border-0 border-b-[0.5px] border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 text-[16px] leading-[24px] text-on-surface transition-colors placeholder-outline/50 shadow-none focus:outline-none" 
                id="email" 
                name="email" 
                placeholder="tu@correo.com" 
                required 
                type="email"
              />
            </div>
            
            {/* Input: Password */}
            <div className="flex flex-col gap-stack-sm group">
              <label className="text-[12px] font-semibold tracking-[0.1em] uppercase text-on-surface-variant group-focus-within:text-primary transition-colors" htmlFor="password">
                Contraseña
              </label>
              <input 
                className="w-full bg-transparent border-0 border-b-[0.5px] border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 text-[16px] leading-[24px] text-on-surface transition-colors placeholder-outline/50 shadow-none focus:outline-none" 
                id="password" 
                name="password" 
                placeholder="Al menos 8 caracteres" 
                required 
                type="password"
              />
            </div>
            
            {/* Actions */}
            <div className="flex flex-col mt-stack-lg gap-stack-md">
              <button 
                className="w-full bg-primary text-on-primary text-[15px] font-medium py-[18px] rounded-full flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container transition-all duration-300 shadow-[0_4px_20px_rgba(142,53,74,0.15)] hover:shadow-[0_4px_24px_rgba(142,53,74,0.2)]" 
                type="submit"
              >
                Crear cuenta
              </button>
              
              <div className="text-left mt-stack-sm">
                <span className="text-[16px] leading-[24px] text-on-surface-variant">
                  ¿Ya tienes una cuenta? {' '}
                </span>
                <Link 
                  className="text-[16px] leading-[24px] text-primary hover:text-on-primary-fixed-variant transition-colors underline decoration-[0.5px] underline-offset-4" 
                  href="/login"
                >
                  Inicia sesión
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
