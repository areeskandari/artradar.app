import type { Metadata } from 'next'
import { Suspense } from 'react'
import { DonateForm } from './DonateForm'
import { PageHeader } from '@/components/ui/Typography'

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support Art Radar — your free guide to Dubai’s galleries, events, and artists. Donate to keep the art scene accessible to everyone.',
  keywords: ['donate Art Radar', 'support Dubai art', 'art scene donation'],
  openGraph: {
    title: 'Donate | Art Radar',
    description: 'Support Art Radar and help keep Dubai’s art scene free and accessible.',
    url: '/donate',
  },
  alternates: { canonical: '/donate' },
  robots: { index: true, follow: true },
}

const SUGGESTED_AMOUNTS = [5, 10, 50, 100, 200, 500]

export default function DonatePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full min-w-0">
      <PageHeader
        eyebrow="Community supported"
        title="Support Art Radar"
        description="Art Radar is a free guide to Dubai's galleries, exhibitions, artists, and events — helping people discover what's on without paywalls or memberships."
        className="mb-10"
      />

      <div className="bg-card border border-ink-200 rounded-xl p-6 sm:p-8 mb-8">
        <h2 className="type-h3 mb-2">Why donate?</h2>
        <ul className="space-y-3 type-body text-ink-600">
          <li className="flex gap-2">
            <span className="text-gold-500 shrink-0">·</span>
            <span>Keep our directory, event calendar, and map free for everyone — galleries, artists, and visitors alike.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gold-500 shrink-0">·</span>
            <span>Help us maintain accurate listings, add new venues, and improve the experience for the whole community.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-gold-500 shrink-0">·</span>
            <span>Your contribution goes directly toward running Art Radar — no ads, no data selling, just a better art scene.</span>
          </li>
        </ul>
      </div>

      <Suspense fallback={<div className="h-40 rounded-xl bg-ink-50 animate-pulse" />}>
        <DonateForm suggestedAmounts={SUGGESTED_AMOUNTS} />
      </Suspense>

      <p className="text-center text-xs text-ink-400 mt-8">
        Secure payment via Stripe. You can use any major card. We don’t store your card details.
      </p>
    </div>
  )
}
