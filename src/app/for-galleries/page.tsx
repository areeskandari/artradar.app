import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Archive,
  TrendingUp,
  MapPin,
  BarChart3,
  Eye,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'For Galleries',
  description:
    'Art Radar for galleries — manage inventory, sell more, track consignments, report on sales, and host exclusive online viewings.',
  keywords: [
    'art gallery software',
    'gallery inventory',
    'art gallery platform',
    'Dubai galleries',
    'Art Radar for galleries',
  ],
  openGraph: {
    title: 'For Galleries | Art Radar',
    description:
      'Discover the next generation platform to efficiently run and grow your art gallery.',
    url: '/for-galleries',
  },
  alternates: { canonical: '/for-galleries' },
  robots: { index: true, follow: true },
}

const FEATURES = [
  {
    title: 'Manage',
    description:
      'Catalog your full art inventory, current and sold. Share only what you choose.',
    icon: Archive,
  },
  {
    title: 'Sell more',
    description:
      'Sell more by displaying a selection of your art on your gallery website, in a private room, and by using social media tools.',
    icon: TrendingUp,
  },
  {
    title: 'Track',
    description:
      'Send your artworks to exhibitions with professional consignments and keep tabs where they are and when they\'re due back.',
    icon: MapPin,
  },
  {
    title: 'Report',
    description:
      'Gain insights into the full value of your inventory, report on sales and production, and other statistics.',
    icon: BarChart3,
  },
  {
    title: 'Exhibit',
    description:
      'Create Private Rooms (online spaces) and invite your contacts to exclusive, online viewings of a selection of your art.',
    icon: Eye,
  },
  {
    title: 'Focus on what matters',
    description:
      'Get organized and get back the time to focus on your clients and growing your business.',
    icon: Sparkles,
  },
] as const

export default function ForGalleriesPage() {
  return (
    <div className="w-full min-w-0">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-200 bg-gradient-to-b from-gold-50/60 via-cream to-cream geometric-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <p className="type-eyebrow text-gold-600 mb-4">
            Software for art galleries
          </p>
          <h1 className="type-display mb-6">
            Art Gallery Software&nbsp;Reinvented.
          </h1>
          <p className="type-lead text-ink-600 max-w-2xl mx-auto mb-8">
            Discover the Next Generation platform to efficiently run and grow your art gallery.
          </p>
          <div className="gold-divider w-24 mx-auto mb-8" />
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gold-500 text-white font-medium hover:bg-gold-600 transition-colors"
          >
            Contact us
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="type-h2 mb-3">
            Powerful and flexible solution for art galleries
          </h2>
          <p className="type-lead-sm text-ink-600 max-w-2xl mx-auto">
            Everything you need to manage inventory, reach collectors, and grow your gallery — in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="bg-card border border-ink-200 rounded-xl p-6 sm:p-7 card-hover"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gold-50 text-gold-600 shrink-0">
                    <Icon size={20} />
                  </div>
                  <h3 className="type-h4">{feature.title}</h3>
                </div>
                <p className="type-small text-ink-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink-950 text-ink-200 geometric-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16 text-center">
          <h2 className="type-h2 text-white mb-4">
            Ready to grow your gallery?
          </h2>
          <p className="type-lead-sm text-ink-400 mb-8 max-w-xl mx-auto">
            Get in touch to learn how Art Radar can help you manage inventory, reach more collectors,
            and focus on what you do best.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gold-500 text-white font-medium hover:bg-gold-600 transition-colors w-full sm:w-auto justify-center"
            >
              Contact us
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/galleries"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-ink-600 text-ink-300 font-medium hover:bg-ink-900 hover:text-white transition-colors w-full sm:w-auto justify-center"
            >
              Browse galleries
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
