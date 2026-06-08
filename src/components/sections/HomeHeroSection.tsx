import Link from 'next/link'
import {
  Buildings,
  Gallery,
  Building4,
  Book1,
  Calendar,
  Profile2User,
  DocumentText,
  Map1,
  MessageTime,
  type Icon,
} from 'iconsax-react'
import { GALLERY_TYPES } from '@/lib/utils'
import type { GalleryType } from '@/types'

const GALLERY_CATEGORY_ICONS: Record<string, Icon> = {
  all: Buildings,
  gallery: Gallery,
  museum: Building4,
  library: Book1,
}

const GALLERY_CATEGORIES = [
  { href: '/galleries', label: 'All Galleries', type: 'all' as const },
  ...GALLERY_TYPES.map((t) => ({
    href: `/galleries?type=${t.value}`,
    label: t.label,
    type: t.value as GalleryType,
  })),
]

const TOP_ROUTES = [
  { href: '/galleries', label: 'Galleries', icon: Buildings },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/artists', label: 'Artists', icon: Profile2User },
  { href: '/news', label: 'News', icon: DocumentText },
  { href: '/map', label: 'Map', icon: Map1 },
  { href: '/timeline', label: 'Timeline', icon: MessageTime },
] as const

const iconProps = { size: 22, color: 'currentColor', variant: 'Linear' as const }

function NavPill({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon: Icon
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-ink-200 bg-card text-ink-700 hover:border-gold-300 hover:bg-gold-50 hover:text-gold-700 transition-colors"
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-ink-50 text-ink-600 group-hover:bg-gold-100 group-hover:text-gold-600 transition-colors">
        <Icon {...iconProps} />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

export function HomeHeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-ink-200 bg-gradient-to-b from-gold-50/60 via-cream to-cream geometric-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-10">
          <p className="type-eyebrow text-gold-600 mb-3">Dubai art scene</p>
          <h1 className="type-display mb-3">Your Guide to Dubai&rsquo;s Art Scene</h1>
          <p className="type-lead-sm text-ink-600 max-w-2xl mx-auto">
            Step into a world of art, where vibrant, exhibitions meet the warmth of a living environment. Discover, connect and be inspired.
          </p>
          <div className="gold-divider w-24 mx-auto mt-5" />
        </div>

        <div className="space-y-5">
          <div>
            <p className="type-eyebrow text-ink-500 text-center mb-3">Gallery categories</p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {GALLERY_CATEGORIES.map((cat) => {
                const Icon = GALLERY_CATEGORY_ICONS[cat.type]
                return <NavPill key={cat.href} href={cat.href} label={cat.label} icon={Icon} />
              })}
            </div>
          </div>

          <div>
            <p className="type-eyebrow text-ink-500 text-center mb-3">Explore</p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {TOP_ROUTES.map((route) => (
                <NavPill key={route.href} href={route.href} label={route.label} icon={route.icon} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
