import React from 'react'
import { CheckinProvider } from '@/components/providers/CheckinProvider'
import { MobileNav, DesktopNav } from '@/components/ui/MobileNav'
import { getCheckinStatus, getWeeklyHistory } from '@/lib/actions/checkin-status'
import { getUserProfile } from '@/lib/actions/auth'
import { TopAppBar } from '@/components/ui/TopAppBar'
import { DesktopSidebar } from '@/components/ui/DesktopSidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const status = await getCheckinStatus()
  const weeklyHistory = await getWeeklyHistory()
  const userProfile = await getUserProfile()

  const isPendingApproval = userProfile?.estado === 'pendiente'

  return (
    <CheckinProvider
      initialIsPending={status.isPending}
      initialClinicalDate={status.clinicalDate || null}
      initialTodayCheckin={status.todayCheckin}
      initialWeeklyHistory={weeklyHistory}
    >
      <div className="min-h-screen flex flex-col md:flex-row relative">
        {/* Global TopAppBar (Mobile Only) */}
        <TopAppBar avatarUrl={userProfile?.avatar_url} />

        {/* Global Desktop Sidebar */}
        <DesktopSidebar avatarUrl={userProfile?.avatar_url} nombre={userProfile?.nombre} />

        {/* Main Content Area */}
        <div className={`flex-1 md:pl-[280px] pt-[73px] md:pt-0 ${isPendingApproval ? 'blur-md opacity-30 select-none pointer-events-none' : ''}`}>
          {children}
        </div>

        {/* Lock Overlay */}
        {isPendingApproval && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-background/40 backdrop-blur-[2px]">
            <div className="max-w-md w-full bg-surface-container-lowest border-[0.5px] border-outline-variant rounded-2xl p-8 shadow-[0_12px_40px_rgba(142,53,74,0.08)] flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary-fixed-dim/20 flex items-center justify-center mb-6 text-primary">
                <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              </div>
              <h2 className="font-serif text-[28px] leading-[36px] tracking-[-0.01em] text-on-surface mb-4">
                Santuario en preparación
              </h2>
              <p className="text-[16px] leading-[24px] text-on-surface-variant mb-8">
                Tu cuenta ha sido creada exitosamente. Almudena está revisando tu acceso para asegurarse de que todo esté listo para acompañarte en tu proceso.
              </p>
              <a 
                href="https://wa.me/1234567890?text=Hola%20Almudena,%20ya%20creé%20mi%20cuenta%20en%20Volver%20A%20Ti.%20¿Podrías%20darme%20acceso?" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white text-[15px] font-medium py-4 rounded-full flex items-center justify-center gap-2 hover:bg-[#20b858] transition-colors shadow-sm pointer-events-auto"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* BottomNavBar (Mobile Only) */}
        <div className="z-50 relative w-full md:w-auto">
          <MobileNav />
        </div>
      </div>
    </CheckinProvider>
  )
}
