import Link from 'next/link'
import { Oswald } from 'next/font/google'
import { ArrowRight, Calendar, Clock, ExternalLink, Instagram, MapPin } from 'lucide-react'
import { KEEP_ON_YOUR_RADAR as EVENT } from '@/lib/keep-on-your-radar'
import { cn } from '@/lib/utils'

const radarDisplay = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
})

export function radarDisplayClass() {
  return radarDisplay.className
}

export function RadarEventActions({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <a
        href={EVENT.joinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#fa6628] px-5 py-2.5 text-sm font-semibold text-[#fff7f0] transition-colors hover:bg-[#e24e14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fa6628]/50"
      >
        Join the walk
        <ExternalLink size={14} strokeWidth={2} />
      </a>
      <a
        href={EVENT.detailsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#fa6628]/40 bg-[#fff7f0]/40 px-5 py-2.5 text-sm font-semibold text-[#fa6628] transition-colors hover:border-[#fa6628] hover:bg-[#fff7f0]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fa6628]/50"
      >
        <Instagram size={14} strokeWidth={2} />
        Details
      </a>
    </div>
  )
}

export function RadarGalleryPath() {
  const last = EVENT.galleries.length - 1

  return (
    <ol className="relative">
      {EVENT.galleries.map((gallery, index) => {
        const isFirst = index === 0
        const isLast = index === last
        const name = gallery.external ? (
          <a
            href={gallery.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-[#3a271c] hover:text-[#fa6628] transition-colors"
          >
            <ArrowRight size={14} strokeWidth={2} className="shrink-0 text-[#fa6628]" aria-hidden />
            {gallery.name}
          </a>
        ) : (
          <Link
            href={gallery.href}
            className="inline-flex items-center gap-1.5 font-medium text-[#3a271c] hover:text-[#fa6628] transition-colors"
          >
            <ArrowRight size={14} strokeWidth={2} className="shrink-0 text-[#fa6628]" aria-hidden />
            {gallery.name}
          </Link>
        )

        return (
          <li key={gallery.name} className="relative flex gap-4 pb-7 last:pb-0">
            <div className="relative flex w-8 shrink-0 flex-col items-center">
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute top-8 bottom-[-1.75rem] w-px bg-[#fa6628]/35"
                />
              )}
              <span
                className={cn(
                  radarDisplay.className,
                  'relative z-[1] flex size-8 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                  isFirst
                    ? 'bg-[#fa6628] text-[#fff7f0] shadow-[0_0_0_4px_rgba(250,102,40,0.18)]'
                    : 'border border-[#fa6628]/50 bg-[#fff7f0] text-[#fa6628]'
                )}
              >
                {index + 1}
              </span>
            </div>
            <div className="min-w-0 pt-0.5">
              {isFirst && (
                <p className="mb-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#fa6628]">
                  Meet here
                </p>
              )}
              {isLast && (
                <p className="mb-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#fa6628]">
                  Last stop
                </p>
              )}
              <p className="leading-snug">{name}</p>
              <a
                href={`https://www.instagram.com/${gallery.handle}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#fa6628] hover:text-[#e24e14] transition-colors"
              >
                @{gallery.handle}
              </a>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function RadarEventMeta({ className }: { className?: string }) {
  return (
    <ul className={cn('space-y-2 text-sm text-[#3a271c]', className)}>
      <li className="flex items-center gap-2.5">
        <Calendar size={15} strokeWidth={1.75} className="shrink-0 text-[#fa6628]" />
        <span>{EVENT.dateLabel}</span>
      </li>
      <li className="flex items-center gap-2.5">
        <Clock size={15} strokeWidth={1.75} className="shrink-0 text-[#fa6628]" />
        <span>{EVENT.timeLabel}</span>
      </li>
      <li className="flex items-start gap-2.5">
        <MapPin size={15} strokeWidth={1.75} className="mt-0.5 shrink-0 text-[#fa6628]" />
        <span>{EVENT.locationLabel}</span>
      </li>
    </ul>
  )
}
