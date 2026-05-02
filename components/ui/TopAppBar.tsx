'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

import Image from 'next/image'

export function TopAppBar({ avatarUrl }: { avatarUrl?: string }) {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (pathname === '/ajustes') return null

  return (
    <header 
      className={`md:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-300 w-full px-6 py-4 flex justify-between items-center ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-md border-b-[0.5px] border-primary/20 shadow-[0_4px_24px_rgba(142,53,74,0.05)]' 
          : 'bg-transparent border-b-[0.5px] border-transparent'
      }`}
    >
      <div className="flex items-center w-1/3 justify-start">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-variant flex items-center justify-center shadow-sm relative">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" layout="fill" objectFit="cover" />
          ) : (
            <span className="material-symbols-outlined text-outline">person</span>
          )}
        </div>
      </div>

      <div className="flex items-center w-1/3 justify-center">
        <span className="text-[22px] font-serif italic text-primary">
          Sanctuary
        </span>
      </div>

      <div className="flex items-center w-1/3 justify-end">
        <Link href="/ajustes" className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-surface-variant transition-colors relative z-10">
          <span className="material-symbols-outlined">settings</span>
        </Link>
      </div>
    </header>
  )
}
