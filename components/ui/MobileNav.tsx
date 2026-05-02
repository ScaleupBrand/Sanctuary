'use client'

import { useCheckin } from '@/components/providers/CheckinProvider'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/inicio', icon: 'home', label: 'Inicio', filled: true },
  { href: '/brote', icon: 'bolt', label: 'Brote' },
  { href: '/historial', icon: 'analytics', label: 'Historial' },
  { href: '/regulacion', icon: 'self_care', label: 'Regulación' },
]

export function MobileNav() {
  const { isPending, requestNavigation } = useCheckin()
  const pathname = usePathname()

  if (pathname === '/ajustes') return null

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-2 pt-2 bg-[#FAF9F6]/95 dark:bg-stone-950/95 backdrop-blur-md border-t-[0.5px] border-rose-100 dark:border-stone-900 md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href

        if (!isPending) {
          // No interception needed — use a real anchor for reliable mobile nav
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center touch-manipulation active:scale-95 transition-transform duration-150 ${
                isActive
                  ? 'text-[#8E354A] dark:text-rose-200 font-bold scale-110'
                  : 'text-stone-400 dark:text-stone-600 opacity-60'
              }`}
            >
              <span
                className="material-symbols-outlined mb-1"
                style={isActive && item.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="font-serif text-[10px] tracking-widest uppercase">{item.label}</span>
            </a>
          )
        }

        // Checkin pending — intercept to show modal
        return (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => {
              e.preventDefault()
              requestNavigation(item.href)
            }}
            className={`flex flex-col items-center justify-center touch-manipulation active:scale-95 transition-transform duration-150 ${
              isActive
                ? 'text-[#8E354A] dark:text-rose-200 font-bold scale-110'
                : 'text-stone-400 dark:text-stone-600 opacity-60'
            }`}
          >
            <span
              className="material-symbols-outlined mb-1"
              style={isActive && item.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-serif text-[10px] tracking-widest uppercase">{item.label}</span>
          </a>
        )
      })}
    </nav>
  )
}

export function DesktopNav() {
  const { requestNavigation } = useCheckin()
  const pathname = usePathname()

  return (
    <nav className="flex gap-8">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <button
            key={item.href}
            type="button"
            onClick={() => requestNavigation(item.href)}
            className={`font-medium hover:opacity-80 transition-opacity ${
              isActive ? 'text-[#8E354A] dark:text-rose-200' : 'text-stone-400 dark:text-stone-600'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
