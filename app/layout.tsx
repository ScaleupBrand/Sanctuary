import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: {
    default: 'Sanctuary',
    template: '%s · Sanctuary',
  },
  description: 'App de acompañamiento terapéutico para fibromialgia y dolor crónico.',
  applicationName: 'Sanctuary',
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'Sanctuary',
    description: 'Acompañamiento terapéutico cálido entre sesiones.',
    siteName: 'Sanctuary',
    locale: 'es_ES',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="light">
      <body
        className="bg-background text-on-background font-sans antialiased pb-24 md:pb-0"
      >
        {children}
        <Toaster
          position="top-center"
          richColors={false}
          toastOptions={{
            classNames: {
              toast: 'border-[#dac0c3] bg-[#fff8f7] text-[#22191a] shadow-[0_12px_32px_rgba(142,53,74,0.12)]',
              title: 'text-[15px] font-medium leading-[22px]',
              description: 'text-[#544245]',
              success: 'border-[#dac0c3] bg-[#fff8f7] text-[#22191a]',
              error: 'border-[#f0a39d] bg-[#fff0f1] text-[#701e34]',
            },
          }}
        />
      </body>
    </html>
  )
}
