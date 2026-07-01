import type { Metadata } from 'next'
import { PageHeader } from '@/components/ui/Typography'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Art Radar for listings, partnerships, and corrections. WhatsApp and email.',
  keywords: ['contact Art Radar', 'Dubai art contact', 'list your gallery', 'art event submission'],
  openGraph: {
    title: 'Contact | Art Radar',
    description: 'Contact Art Radar for listings, partnerships, and corrections.',
    url: '/contact',
  },
  alternates: { canonical: '/contact' },
  robots: { index: true, follow: true },
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <PageHeader
        eyebrow="Get in touch"
        title="Contact us"
        description="For listings, partnerships, corrections, or general questions — reach out anytime."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-ink-200 rounded-xl p-6">
          <h2 className="type-h4 mb-1">WhatsApp</h2>
          <p className="type-small text-ink-600 mb-4">
            Fastest way to reach us. Ideal for quick corrections, last-minute updates, or sending a poster image.
          </p>
          <a
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white hover:opacity-90 transition-opacity w-full sm:w-auto"
            href="https://wa.me/971558401009?text=Hi%20Dubai%20Art%20Radar%2C%20I%27d%20like%20to%20share%20a%20listing%20update."
            target="_blank"
            rel="noreferrer"
          >
            Message +971558401009
          </a>
          <p className="mt-3 text-xs text-ink-500">
            Tip: You can also use the WhatsApp button on every page (bottom-right).
          </p>
        </div>

        <div className="bg-card border border-ink-200 rounded-xl p-6">
          <h2 className="type-h4 mb-1">Email</h2>
          <p className="type-small text-ink-600 mb-4">
            For detailed requests, press releases, and attachments.
          </p>
          <a
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-ink-300 text-ink-700 hover:bg-ink-50 hover:border-ink-400 transition-colors w-full sm:w-auto"
            href="mailto:hello@dubaiartradar.com"
          >
            hello@dubaiartradar.com
          </a>
          <p className="mt-3 text-xs text-ink-500">
            Mock email for now — swap it to your real inbox when ready.
          </p>
        </div>
      </div>

      <div className="mt-4 bg-card border border-ink-200 rounded-xl p-6">
        <h2 className="type-h4 mb-2">What to include (mock checklist)</h2>
        <div className="type-small text-ink-700 space-y-2">
          <p>
            - <span className="text-ink-900 font-medium">For events</span>: title, dates, venue, event type, ticket/free entry info, and 1 image.
          </p>
          <p>
            - <span className="text-ink-900 font-medium">For galleries</span>: address, area, website, Instagram, and opening hours (if public).
          </p>
          <p>
            - <span className="text-ink-900 font-medium">For artists</span>: bio, city, links, and 1–2 representative images (optional).
          </p>
        </div>
      </div>
    </div>
  )
}

