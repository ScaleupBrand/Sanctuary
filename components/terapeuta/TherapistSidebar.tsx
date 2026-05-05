import Link from 'next/link'
import type { ComponentType } from 'react'
import { Calendar, Grid, KeyRound, Library, LogOut, Settings, Users } from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import { getInitials } from '@/lib/terapeuta/dashboard'

type SidebarItem = {
  href: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  activeWhen: string[]
}

const items: SidebarItem[] = [
  { href: '/terapeuta/dashboard', icon: Grid, label: 'Panel Principal', activeWhen: ['/terapeuta/dashboard'] },
  { href: '/terapeuta/clientas', icon: Users, label: 'Mis Clientas', activeWhen: ['/terapeuta/clientas', '/terapeuta/clienta'] },
  { href: '/terapeuta/agenda', icon: Calendar, label: 'Agenda', activeWhen: ['/terapeuta/agenda'] },
  { href: '/terapeuta/biblioteca', icon: Library, label: 'Biblioteca', activeWhen: ['/terapeuta/biblioteca'] },
  { href: '/terapeuta/accesos', icon: KeyRound, label: 'Accesos', activeWhen: ['/terapeuta/accesos'] },
]

export function TherapistSidebar({
  therapistName,
  therapistAvatarUrl,
  activePath,
}: {
  therapistName: string
  therapistAvatarUrl?: string | null
  activePath: string
}) {
  const firstName = therapistName.trim().split(' ')[0] || 'Terapeuta'
  const isSettingsActive = activePath === '/terapeuta/ajustes' || activePath.startsWith('/terapeuta/ajustes/')
  const initials = getInitials(therapistName)

  return (
    <nav className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col bg-[#f8f3f2] px-8 py-10 text-left md:flex">
      <div className="mb-16 flex flex-col items-start gap-6">
        <div>
          <h1 className="font-serif text-[28px] italic leading-none tracking-tight text-primary">Sanctuary</h1>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a68b8b]">Portal del Terapeuta</p>
        </div>

        <div className="flex items-center gap-4">
          {therapistAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={therapistAvatarUrl}
              alt={`Foto de ${firstName}`}
              className="size-12 shrink-0 rounded-full border border-[#ead7d7] object-cover"
            />
          ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#ead7d7] bg-primary-fixed font-serif text-sm text-primary">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight text-on-background">{firstName}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a68b8b]">Portal</p>
          </div>
        </div>
      </div>

      <div className="flex flex-grow flex-col gap-1">
        {items.map((item) => {
          const isActive = item.activeWhen.some((path) => activePath === path || activePath.startsWith(`${path}/`))
          const Icon = item.icon

          return isActive ? (
            <div key={item.href} className="relative">
              <div className="absolute left-0 top-0 h-full w-[2px] rounded-r-full bg-primary" />
              <Link
                href={item.href}
                className="flex items-center gap-4 rounded-r-xl bg-[#fdf7f7] px-4 py-3 font-medium text-primary"
              >
                <Icon className="size-5" strokeWidth={1.8} />
                <span className="text-sm font-medium tracking-wide">{item.label}</span>
              </Link>
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-4 rounded-lg px-4 py-3 text-[#a68b8b] transition-all duration-300 hover:text-primary"
            >
              <Icon className="size-5 transition-transform group-hover:scale-110" strokeWidth={1.7} />
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="mt-auto flex flex-col gap-1 border-t border-[#ead7d7] pt-6">
        <Link
          href="/terapeuta/ajustes"
          className={`group flex items-center gap-4 rounded-lg px-4 py-3 transition-all duration-300 hover:text-primary ${
            isSettingsActive ? 'font-semibold text-primary' : 'text-outline'
          }`}
        >
          <Settings className="size-5 transition-transform group-hover:scale-110" strokeWidth={1.7} />
          <span className="text-sm font-medium tracking-wide">Ajustes</span>
        </Link>

        <form action={logout}>
          <button className="group flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-outline transition-all duration-300 hover:text-primary">
            <LogOut className="size-5 transition-transform group-hover:scale-110" strokeWidth={1.7} />
            <span className="text-sm font-medium tracking-wide">Cerrar sesión</span>
          </button>
        </form>
      </div>
    </nav>
  )
}
