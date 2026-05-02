import React from 'react'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // We don't include the global TopAppBar or MobileNav here
  // because the onboarding flow should be isolated.
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md text-body-md antialiased">
      {children}
    </div>
  )
}
