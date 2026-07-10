import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import dynamic from 'next/dynamic'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { JsonLd } from '@/components/seo/JsonLd'
import Script from 'next/script'
import { cn } from '@/lib/utils'
import { notoSerif } from '@/lib/fonts'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, organizationSchema, websiteSchema } from '@/lib/seo'

const WhatsAppShortcut = dynamic(
  () => import('@/components/whatsapp/WhatsAppShortcut').then((m) => ({ default: m.WhatsAppShortcut })),
  { ssr: false }
)

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Your Guide to Dubai's Art Scene`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['Dubai art', 'galleries Dubai', 'art exhibitions Dubai', 'artists UAE', 'DIFC galleries', 'Alserkal Avenue', 'UAE art', 'Dubai galleries', 'art events Dubai', 'Abu Dhabi art', 'MENA art'],
  openGraph: {
    type: 'website',
    locale: 'en_AE',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Your Guide to Dubai's Art Scene`,
    description: SITE_DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Your Guide to Dubai's Art Scene`,
    description: SITE_DESCRIPTION,
  },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
    apple: [{ url: '/logo.png', type: 'image/png' }],
  },
  verification: {
    // Optional: add when you have them
    // google: 'google-site-verification-code',
    // yandex: 'yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn('light font-sans', notoSerif.variable)} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga4"
              strategy="afterInteractive"
            >
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Suspense fallback={<div className="sticky top-0 z-50 h-16 border-b border-ink-200 bg-cream/95" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
        <Footer />
        <WhatsAppShortcut />
      </body>
    </html>
  )
}
