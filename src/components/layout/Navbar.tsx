'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Building2, Calendar, User, Newspaper, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand/Logo'

const NAV_LINKS = [
  { href: '/galleries', label: 'Galleries', icon: Building2 },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/artists', label: 'Artists', icon: User },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/map', label: 'Map', icon: MapPin, beta: true },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-ink-200 w-full min-w-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full min-w-0">
        <div className="flex items-center justify-between h-16 min-w-0">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Logo variant="mark" />
            <div className="hidden sm:block">
              <span className="font-semibold text-lg text-ink-900 group-hover:text-gold-600 transition-colors">
                Art Radar
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded transition-colors inline-flex items-center gap-1.5',
                    pathname.startsWith(link.href)
                      ? 'text-gold-600 bg-gold-50'
                      : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'
                  )}
                >
                  <Icon size={16} className="shrink-0" />
                  {link.label}
                  {'beta' in link && link.beta && (
                    <span className="text-[9px] font-medium uppercase tracking-wider text-ink-500 bg-ink-100 px-1 py-0.5 rounded">
                      beta
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-ink-600 hover:text-ink-900"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ink-200 bg-cream">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block px-3 py-2 text-sm font-medium rounded transition-colors inline-flex items-center gap-2',
                    pathname.startsWith(link.href)
                      ? 'text-gold-600 bg-gold-50'
                      : 'text-ink-700 hover:text-ink-900 hover:bg-ink-50'
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  {link.label}
                  {'beta' in link && link.beta && (
                    <span className="text-[9px] font-medium uppercase tracking-wider text-ink-500 bg-ink-100 px-1 py-0.5 rounded">
                      beta
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
