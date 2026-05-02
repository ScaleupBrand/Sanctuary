'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCheckin } from '@/components/providers/CheckinProvider'

const navItems = [
  { href: '/inicio', icon: 'home', label: 'Inicio', filled: true },
  { href: '/brote', icon: 'bolt', label: 'Brote' },
  { href: '/historial', icon: 'analytics', label: 'Historial' },
  { href: '/regulacion', icon: 'self_care', label: 'Regulación' },
]

export function DesktopSidebar({ avatarUrl, nombre }: { avatarUrl?: string | null, nombre?: string | null }) {
  const { isPending, requestNavigation } = useCheckin()
  const pathname = usePathname()

  // Ocultar si estamos en Ajustes (o dejarlo visible si preferimos mantener contexto)
  // El layout original oculta el TopAppBar en Ajustes. Para la barra lateral (Desktop) 
  // es mejor mantenerla visible para no perder la navegación.

  return (
    <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-[280px] bg-surface-container-lowest border-r-[0.5px] border-outline-variant/30 shadow-[4px_0_24px_rgba(142,53,74,0.02)] z-40">
      
      {/* Brand Header */}
      <div className="h-24 flex items-center px-8 border-b-[0.5px] border-outline-variant/20">
        <span className="text-[28px] font-serif italic text-primary">
          Sanctuary
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          const content = (
            <>
              <span 
                className={`material-symbols-outlined text-[24px] transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                style={isActive && item.filled ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-button-text text-[15px] tracking-wide font-medium">
                {item.label}
              </span>
            </>
          )

          const baseClass = `flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group ${
            isActive 
              ? 'bg-primary-fixed-dim/20 text-primary' 
              : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'
          }`

          if (!isPending) {
            return (
              <Link key={item.href} href={item.href} className={baseClass}>
                {content}
              </Link>
            )
          }

          // If pending, intercept navigation
          return (
            <button 
              key={item.href} 
              onClick={(e) => {
                e.preventDefault()
                requestNavigation(item.href)
              }}
              className={`${baseClass} text-left`}
            >
              {content}
            </button>
          )
        })}
      </nav>

      {/* Footer: User Profile & Settings */}
      <div className="p-6 border-t-[0.5px] border-outline-variant/20">
        <Link href="/ajustes" className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-variant/50 transition-colors group">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-variant flex items-center justify-center shrink-0 shadow-sm relative">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" layout="fill" objectFit="cover" />
            ) : (
              <span className="material-symbols-outlined text-[24px] text-outline">person</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body-md font-medium text-on-surface truncate">
              {nombre ? nombre.split(' ')[0] : 'Mi Perfil'}
            </p>
            <p className="font-body-md text-[13px] text-on-surface-variant truncate">
              Ajustes
            </p>
          </div>
          <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">
            settings
          </span>
        </Link>
      </div>

    </aside>
  )
}
