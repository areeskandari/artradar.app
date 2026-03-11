import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description: 'Dubai Art Radar is a curated guide to Dubai’s galleries, artists, exhibitions, and cultural events. Our mission and what you’ll find.',
  openGraph: {
    title: 'About | Dubai Art Radar',
    description: 'Dubai Art Radar is a curated guide to Dubai’s galleries, artists, exhibitions, and cultural events.',
    url: '/about',
  },
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-ink-900 mb-2">About Dubai Art Radar</h1>
        <p className="text-ink-600">
          Dubai Art Radar is a curated guide to Dubai&rsquo;s galleries, artists, exhibitions, and cultural events — built for people who want to
          discover what&rsquo;s on, save time, and explore with confidence.
        </p>
        <div className="gold-divider w-16 mt-3" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white border border-ink-200 rounded-xl p-6 sm:p-8 space-y-4">
          <h2 className="font-semibold text-ink-900 text-lg">Our mission</h2>
          <p className="text-ink-700 leading-relaxed">
            Make Dubai&rsquo;s art scene easier to navigate — a clean directory, a reliable calendar, and an editorial feed that highlights the most
            relevant openings and announcements.
          </p>
          <p className="text-ink-700 leading-relaxed">
            We focus on clarity: accurate dates, verified listings, and the right context (where, when, what type of event, and who is exhibiting).
          </p>
        </div>

        <div className="bg-white border border-ink-200 rounded-xl p-6 sm:p-8">
          <h2 className="font-semibold text-ink-900 text-lg mb-4">What you&rsquo;ll find on Dubai Art Radar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: 'Galleries directory',
                desc: 'A searchable list of galleries, museums, and cultural spaces across DIFC, Alserkal Avenue, Downtown, and beyond.',
              },
              {
                title: 'Events calendar',
                desc: 'Exhibitions, talks, workshops, openings, performances — with dates, locations, and ticket/admission info.',
              },
              {
                title: 'Artist profiles',
                desc: 'Artist pages with bio, links, and connected exhibitions/events to understand context and practice quickly.',
              },
              {
                title: 'News & updates',
                desc: 'Short editorial posts: opening announcements, programme highlights, and key art-world updates in the UAE.',
              },
            ].map((c) => (
              <div key={c.title} className="border border-ink-200 rounded-xl p-4 bg-ink-50">
                <p className="text-ink-900 font-medium mb-1">{c.title}</p>
                <p className="text-sm text-ink-600 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-ink-200 rounded-xl p-6 sm:p-8 space-y-4">
          <h2 className="font-semibold text-ink-900 text-lg">How listings work (mock policy)</h2>
          <div className="text-sm text-ink-700 space-y-3 leading-relaxed">
            <p>
              - <span className="text-ink-900 font-medium">Galleries</span>: We prioritise accuracy (address, area, links, submission policy when
              available). Updates are welcome anytime.
            </p>
            <p>
              - <span className="text-ink-900 font-medium">Events</span>: Please include title, opening date (if any), exhibition period, location,
              and a press image link or uploaded image. We can also list free RSVP/ticket links.
            </p>
            <p>
              - <span className="text-ink-900 font-medium">Artists</span>: Bios can be short or detailed. We recommend 120–250 words plus links.
            </p>
            <p className="text-xs text-ink-500">
              This is mock text for now — you can replace it with your real editorial and submission rules later.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500 text-white hover:bg-gold-600 transition-colors"
            >
              Browse events
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-ink-300 text-ink-700 hover:bg-ink-50 hover:border-ink-400 transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

