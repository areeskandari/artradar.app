import type { Metadata } from 'next'
import { ArtRadarChatbot } from '@/components/sections/ArtRadarChatbot'

export const metadata: Metadata = {
  title: 'Ask Dubai Art Radar',
  description: 'Ask questions about galleries, events, artists, and news in Dubai. Get answers powered by our art scene database.',
  openGraph: {
    title: 'Ask Dubai Art Radar | Dubai Art Radar',
    description: 'Ask questions about galleries, events, artists, and news in Dubai.',
    url: '/ask',
  },
  alternates: { canonical: '/ask' },
}

export default function AskPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-6">
        <h1 className="font-semibold text-2xl sm:text-3xl text-ink-900 mb-1">Ask Dubai Art Radar</h1>
        <p className="text-ink-500 text-sm">
          Get answers about galleries, events, artists, and news — powered by our database.
        </p>
        <div className="h-px w-16 bg-gold-400/50 mt-3" />
      </div>

      <ArtRadarChatbot fullPage />
    </div>
  )
}
