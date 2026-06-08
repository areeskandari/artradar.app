'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, Building2, Calendar, Brush, User, Newspaper, MapPin, ChevronDown, Info, Mail } from 'lucide-react'
import { cn, GALLERY_TYPES } from '@/lib/utils'
import { Logo } from '@/components/brand/Logo'

const NAV_LINKS = [
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/events?event_type=workshop', label: 'Workshops', icon: Brush },
  { href: '/artists', label: 'Artists', icon: User },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/map', label: 'Map', icon: MapPin },
]

const GALLERY_NAV_LINKS = [
  { href: '/galleries', label: 'All Galleries' },
  ...GALLERY_TYPES.map((type) => ({
    href: `/galleries?type=${type.value}`,
    label: type.label,
  })),
]

const MOBILE_EXTRA_LINKS = [
  { href: '/about', label: 'About Us', icon: Info },
  { href: '/contact', label: 'Contact Us', icon: Mail },
]

export function Navbar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileGalleriesOpen, setMobileGalleriesOpen] = useState(false)

  const isGalleriesActive = pathname === '/galleries' || pathname.startsWith('/galleries/')
  const activeGalleryType = searchParams.get('type')
  const activeEventType = searchParams.get('event_type')

  useEffect(() => {
    if (!mobileOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileOpen])

  useEffect(() => {
    setMobileOpen(false)
    setMobileGalleriesOpen(false)
  }, [pathname])

  const isNavLinkActive = (href: string) => {
    if (href === '/events?event_type=workshop') {
      return pathname === '/events' && activeEventType === 'workshop'
    }
    if (href === '/events') {
      return pathname.startsWith('/events') && activeEventType !== 'workshop'
    }
    return pathname.startsWith(href)
  }

  const navLinkClass = (active: boolean) =>
    cn(
      'px-3 py-2 text-sm font-medium rounded transition-colors inline-flex items-center gap-1.5',
      active
        ? 'text-gold-600 bg-gold-50'
        : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'
    )

  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-ink-200 w-full min-w-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full min-w-0">
        <div className="flex items-center justify-between h-16 min-w-0 md:grid md:grid-cols-[auto_1fr]">
          {/* Mobile: logo | centered title | menu */}
          <div className="grid grid-cols-3 items-center w-full md:hidden">
            <Link href="/" className="justify-self-start">
              <Logo variant="mark" />
            </Link>
            <Link
              href="/"
              className="justify-self-center font-serif text-h4 text-primary tracking-tight hover:text-primary/80 transition-colors"
            >
              Art Radar
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 -mr-2 text-ink-600 hover:text-ink-900 justify-self-end"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Desktop: Logo */}
          <Link href="/" className="hidden md:flex items-center gap-2 group">
            <Logo variant="mark" />
            <span className="font-serif text-h4 text-primary tracking-tight group-hover:text-primary/80 transition-colors">
              Art Radar
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 justify-self-end">
            <div className="relative group">
              <Link
                href="/galleries"
                className={navLinkClass(isGalleriesActive)}
              >
                <Building2 size={16} className="shrink-0" />
                Galleries
                <ChevronDown size={14} className="shrink-0 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="absolute left-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all">
                <div className="min-w-[10rem] rounded-lg border border-ink-200 bg-cream py-1 shadow-lg">
                  {GALLERY_NAV_LINKS.map((link) => {
                    const typeParam = link.href.includes('type=') ? link.href.split('type=')[1] : null
                    const isActive = typeParam
                      ? pathname === '/galleries' && activeGalleryType === typeParam
                      : pathname === '/galleries' && !activeGalleryType
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'block px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'text-gold-600 bg-gold-50 font-medium'
                            : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'
                        )}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {NAV_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={navLinkClass(isNavLinkActive(link.href))}
                >
                  <Icon size={16} className="shrink-0" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile Nav — fixed overlay above page content */}
      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-16 z-40 bg-ink-950/50 md:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 z-[41] md:hidden border-t border-ink-200 bg-cream shadow-lg max-h-[calc(100dvh-4rem)] overflow-y-auto">
          <ul className="divide-y divide-ink-200">
            <li>
              <button
                type="button"
                onClick={() => setMobileGalleriesOpen(!mobileGalleriesOpen)}
                className={cn(
                  'w-full px-4 py-3 text-sm font-medium transition-colors inline-flex items-center justify-between gap-2',
                  isGalleriesActive
                    ? 'text-gold-600 bg-gold-50'
                    : 'text-ink-700 hover:text-ink-900 hover:bg-ink-50'
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Building2 size={18} className="shrink-0" />
                  Galleries
                </span>
                <ChevronDown
                  size={16}
                  className={cn('shrink-0 transition-transform', mobileGalleriesOpen && 'rotate-180')}
                />
              </button>
              {mobileGalleriesOpen && (
                <ul className="border-t border-ink-200 bg-ink-50/50">
                  {GALLERY_NAV_LINKS.map((link) => {
                    const typeParam = link.href.includes('type=') ? link.href.split('type=')[1] : null
                    const isActive = typeParam
                      ? pathname === '/galleries' && activeGalleryType === typeParam
                      : pathname === '/galleries' && !activeGalleryType
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => {
                            setMobileOpen(false)
                            setMobileGalleriesOpen(false)
                          }}
                          className={cn(
                            'block px-4 py-2.5 pl-10 text-sm transition-colors',
                            isActive
                              ? 'text-gold-600 bg-gold-50 font-medium'
                              : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'
                          )}
                        >
                          {link.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>

            {NAV_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block px-4 py-3 text-sm font-medium transition-colors inline-flex items-center gap-2 w-full',
                      isNavLinkActive(link.href)
                        ? 'text-gold-600 bg-gold-50'
                        : 'text-ink-700 hover:text-ink-900 hover:bg-ink-50'
                    )}
                  >
                    <Icon size={18} className="shrink-0" />
                    {link.label}
                  </Link>
                </li>
              )
            })}

            {MOBILE_EXTRA_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block px-4 py-3 text-sm font-medium transition-colors inline-flex items-center gap-2 w-full',
                      pathname === link.href
                        ? 'text-gold-600 bg-gold-50'
                        : 'text-ink-700 hover:text-ink-900 hover:bg-ink-50'
                    )}
                  >
                    <Icon size={18} className="shrink-0" />
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
          </div>
        </>
      )}
    </nav>
  )
}
