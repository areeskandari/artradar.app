import Link from 'next/link'
import { Instagram, Globe } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'

export function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-300 geometric-bg w-full min-w-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <Logo variant="lockup" theme="dark" />
            </Link>
            <p className="text-sm text-ink-400 leading-relaxed">
              Your cultural compass for Dubai&rsquo;s art scene. Galleries, exhibitions, artists, and events — all in one place.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-gold-400 font-medium text-sm uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/galleries', label: 'Galleries' },
                { href: '/events', label: 'Events' },
                { href: '/artists', label: 'Artists' },
                { href: '/news', label: 'News' },
                { href: '/ask', label: 'Ask', beta: true },
                { href: '/map', label: 'Map' },
                { href: '/timeline', label: 'Timeline' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' },
                { href: '/donate', label: 'Donate' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ink-400 hover:text-gold-400 transition-colors">
                    {link.label}
                    {'beta' in link && link.beta && <span className="ml-1 text-[9px] uppercase text-ink-500">beta</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas */}
          <div>
            <h4 className="text-gold-400 font-medium text-sm uppercase tracking-wider mb-3">Areas</h4>
            <ul className="space-y-2 text-sm">
              {['DIFC', 'Alserkal Avenue', 'Downtown', 'JBR', 'Abu Dhabi'].map((area) => (
                <li key={area}>
                  <Link
                    href={`/galleries?area=${encodeURIComponent(area)}`}
                    className="text-ink-400 hover:text-gold-400 transition-colors"
                  >
                    {area}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold-400 font-medium text-sm uppercase tracking-wider mb-3">Contact</h4>
            <p className="text-sm text-ink-400 leading-relaxed">
              Have a question or want to list an event? Message us on WhatsApp.
            </p>
            <div className="mt-3">
              <Link href="/contact" className="text-sm text-ink-400 hover:text-gold-400 transition-colors">
                Contact page
              </Link>
            </div>
          </div>
        </div>

        <div className="gold-divider mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-500">
          <p>© {new Date().getFullYear()} Art Radar. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gold-400 transition-colors">
              <Instagram size={16} />
            </a>
            <a href="#" className="hover:text-gold-400 transition-colors">
              <Globe size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
