import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppShortcut } from '@/components/whatsapp/WhatsAppShortcut'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dubaiartradar.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dubai Art Radar — Your Guide to Dubai's Art Scene",
    template: '%s | Dubai Art Radar',
  },
  description: "Discover galleries, exhibitions, artists and events in Dubai's vibrant art scene. Your cultural compass for the UAE art world.",
  keywords: ['Dubai art', 'galleries Dubai', 'art exhibitions Dubai', 'artists UAE', 'DIFC galleries', 'Alserkal Avenue', 'UAE art', 'Dubai galleries', 'art events Dubai'],
  openGraph: {
    type: 'website',
    locale: 'en_AE',
    siteName: 'Dubai Art Radar',
    title: "Dubai Art Radar — Your Guide to Dubai's Art Scene",
    description: "Discover galleries, exhibitions, artists and events in Dubai's vibrant art scene. Your cultural compass for the UAE art world.",
    url: '/',
    images: [{ url: '/icon.svg', width: 512, height: 512, alt: 'Dubai Art Radar' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dubai Art Radar — Your Guide to Dubai's Art Scene",
    description: "Discover galleries, exhibitions, artists and events in Dubai's vibrant art scene.",
  },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col bg-cream">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  name: 'Dubai Art Radar',
                  url: siteUrl,
                  description: "Your guide to Dubai's art scene — galleries, exhibitions, artists and events.",
                  sameAs: [],
                },
                {
                  '@type': 'WebSite',
                  name: 'Dubai Art Radar',
                  url: siteUrl,
                  description: "Discover galleries, exhibitions, artists and events in Dubai's vibrant art scene.",
                  potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', url: `${siteUrl}/ask` }, 'query-input': 'required name=query' },
                },
              ],
            }),
          }}
        />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppShortcut />
      </body>
    </html>
  )
}
