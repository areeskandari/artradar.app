import Link from 'next/link'
import {
  Instagram,
  Globe,
  Building2,
  Calendar,
  Baby,
  User,
  Newspaper,
  MessageCircle,
  MapPin,
  Clock,
  Info,
  Mail,
  Heart,
  Store,
  type LucideIcon,
} from 'lucide-react'
import { Logo } from '@/components/brand/Logo'

const linkClass = 'inline-flex items-center gap-2 text-ink-400 hover:text-gold-400 transition-colors'

const EXPLORE_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/galleries', label: 'Galleries', icon: Building2 },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/for-kids', label: 'For Kids', icon: Baby },
  { href: '/artists', label: 'Artists', icon: User },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/ask', label: 'Ask', icon: MessageCircle },
  { href: '/map', label: 'Map', icon: MapPin },
  { href: '/timeline', label: 'Timeline', icon: Clock },
]

const CONTACT_LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/about', label: 'About', icon: Info },
  { href: '/contact', label: 'Contact', icon: Mail },
  { href: '/donate', label: 'Donate', icon: Heart },
  { href: '/for-galleries', label: 'For Galleries', icon: Store },
]

function FooterLink({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  return (
    <Link href={href} className={linkClass}>
      <Icon size={14} className="shrink-0 opacity-80" aria-hidden />
      {label}
    </Link>
  )
}

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
            <p className="type-small text-ink-400">
              Your cultural compass for Dubai&rsquo;s art scene. Galleries, exhibitions, artists, and events — all in one place.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="type-eyebrow text-gold-400 mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Areas */}
          <div>
            <h4 className="type-eyebrow text-gold-400 mb-3">Areas</h4>
            <ul className="space-y-2 text-sm">
              {['DIFC', 'Alserkal Avenue', 'Downtown', 'JBR', 'Abu Dhabi'].map((area) => (
                <li key={area}>
                  <Link
                    href={`/galleries?area=${encodeURIComponent(area)}`}
                    className={linkClass}
                  >
                    <MapPin size={14} className="shrink-0 opacity-80" aria-hidden />
                    {area}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="type-eyebrow text-gold-400 mb-3">Contact</h4>
            <p className="type-small text-ink-400 mb-3">
              Have a question or want to list an event? Message us on WhatsApp.
            </p>
            <ul className="space-y-2 text-sm">
              {CONTACT_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
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
