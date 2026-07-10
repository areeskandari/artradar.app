import Link from 'next/link'
import {
  Buildings,
  Gallery,
  Building4,
  Book1,
  Calendar,
  Brush,
  Profile2User,
  DocumentText,
  Map1,
  MessageTime,
  type Icon,
} from 'iconsax-react'
import { GALLERY_TYPES } from '@/lib/utils'
import type { GalleryType } from '@/types'

const GALLERY_CATEGORY_ICONS: Record<GalleryType, Icon> = {
  gallery: Gallery,
  museum: Building4,
  library: Book1,
}

const GALLERY_CATEGORIES = GALLERY_TYPES.map((t) => ({
  href: `/galleries?type=${t.value}`,
  label: t.label,
  type: t.value,
}))

const TOP_ROUTES = [
  { href: '/galleries', label: 'Galleries', icon: Buildings },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/events?event_type=workshop', label: 'Workshops', icon: Brush },
  { href: '/artists', label: 'Artists', icon: Profile2User },
  { href: '/news', label: 'News', icon: DocumentText },
  { href: '/map', label: 'Map', icon: Map1 },
  { href: '/timeline', label: 'Timeline', icon: MessageTime },
] as const

const iconProps = { size: 22, color: 'currentColor', variant: 'Linear' as const }

function CategoryBox({
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
      className="group flex flex-col items-center justify-center gap-2.5 w-24 sm:w-28 py-4 px-3 rounded-lg border border-white/40 bg-white/25 backdrop-blur-md text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.35)] hover:border-white/60 hover:bg-white/35 transition-colors"
    >
      <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 text-white group-hover:bg-white/30 transition-colors">
        <Icon {...iconProps} />
      </span>
      <span className="text-sm font-medium text-center">{label}</span>
    </Link>
  )
}

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
      className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-white/40 bg-white/25 backdrop-blur-md text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.35)] hover:border-white/60 hover:bg-white/35 transition-colors"
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white group-hover:bg-white/30 transition-colors">
        <Icon {...iconProps} />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

export function HomeHeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-ink-200">
      <div className="absolute inset-0" aria-hidden>
        {/* Served as-is from /public — no Next.js image optimization */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-gallery.png"
          alt="Contemporary art gallery interior in Dubai"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/65 to-ink-950/55" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="font-serif text-[clamp(3rem,12vw,4.5rem)] leading-[1.08] tracking-[-0.025em] font-normal text-white sm:text-display mb-3">
            Your Guide to MENA Art Scene
          </h1>
          <p className="type-lead-sm text-white/95 max-w-2xl mx-auto font-medium">
            Art Radar is a free directory of galleries, exhibitions, artists, and art prizes across Dubai, Abu Dhabi, and the wider MENA region — built for collectors, curators, and anyone exploring the UAE art scene.
          </p>
          <p className="type-lead-sm text-white/80 max-w-2xl mx-auto mt-3">
            Discover what&apos;s on, filter by area or event type, and explore with confidence.
          </p>
          <div className="w-24 h-px bg-white/50 mx-auto mt-5" />
        </div>

        <div className="space-y-5">
          <div>
            <p className="type-eyebrow !text-white text-center mb-3">Gallery categories</p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {GALLERY_CATEGORIES.map((cat) => {
                const Icon = GALLERY_CATEGORY_ICONS[cat.type]
                return <CategoryBox key={cat.href} href={cat.href} label={cat.label} icon={Icon} />
              })}
            </div>
          </div>

          <div>
            <p className="type-eyebrow !text-white text-center mb-3">Explore</p>
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
