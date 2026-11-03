'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PageBannerItem } from '@/lib/banners'

interface PageBannerProps {
  items: PageBannerItem[]
  className?: string
  size?: 'default' | 'compact'
  /** When false, the image well has no fill color (for transparent artwork). */
  background?: boolean
}

function BannerSlide({ item, objectClass }: { item: PageBannerItem; objectClass: string }) {
  const image = (
    // Served as-is from /public so the grain of the artwork stays intact
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.imageSrc}
      alt={item.alt}
      className={cn('absolute inset-0 h-full w-full', objectClass)}
    />
  )

  if (item.href) {
    const isExternal = item.href.startsWith('http')
    if (isExternal) {
      return (
        <a href={item.href} target="_blank" rel="noopener noreferrer" className="absolute inset-0">
          {image}
        </a>
      )
    }
    return (
      <Link href={item.href} className="absolute inset-0">
        {image}
      </Link>
    )
  }

  return <div className="absolute inset-0">{image}</div>
}

export function PageBanner({ items, className, size = 'default', background = true }: PageBannerProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = items.length
  const showControls = count > 1

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return
      setIndex(((next % count) + count) % count)
    },
    [count]
  )

  useEffect(() => {
    if (!showControls || paused) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [count, paused, showControls])

  if (count === 0) return null

  const objectClass = size === 'compact' ? 'object-contain object-left' : 'object-cover object-left'
  const current = items[index]
  const hasCaption = Boolean(current?.name || current?.date || current?.location)

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured banners"
      className={cn('relative', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-lg',
          background && 'bg-[#E9D8BE]',
          size === 'compact'
            ? 'aspect-[1020/560] lg:aspect-auto lg:h-[168px] xl:h-[180px]'
            : 'aspect-[1020/560] sm:aspect-[2.15/1] lg:aspect-[2.4/1]'
        )}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {items.map((item) => (
            <div key={item.id} className="relative h-full w-full shrink-0" aria-hidden={item.id !== items[index].id}>
              <BannerSlide item={item} objectClass={objectClass} />
            </div>
          ))}
        </div>

        {showControls && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute left-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/80 text-ink-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Previous banner"
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute right-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/80 text-ink-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Next banner"
            >
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-[width,background-color] duration-300',
                    i === index ? 'w-6 bg-primary' : 'w-1.5 bg-ink-900/30 hover:bg-ink-900/50'
                  )}
                  aria-label={`Show banner ${i + 1}`}
                  aria-current={i === index}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {hasCaption && (
        <BannerCaption item={current} />
      )}
    </section>
  )
}

function BannerCaption({ item }: { item: PageBannerItem }) {
  const content = (
    <>
      {item.name && (
        <p className="text-sm font-medium text-ink-900 group-hover:text-gold-600 transition-colors line-clamp-1">
          {item.name}
        </p>
      )}
      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
        {item.date && (
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={12} strokeWidth={1.5} className="shrink-0" />
            {item.date}
          </span>
        )}
        {item.location && (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin size={12} strokeWidth={1.5} className="shrink-0" />
            <span className="line-clamp-1">{item.location}</span>
          </span>
        )}
      </p>
    </>
  )

  if (item.href) {
    const isExternal = item.href.startsWith('http')
    if (isExternal) {
      return (
        <a href={item.href} target="_blank" rel="noopener noreferrer" className="group mt-3 block">
          {content}
        </a>
      )
    }
    return (
      <Link href={item.href} className="group mt-3 block">
        {content}
      </Link>
    )
  }

  return <div className="mt-3">{content}</div>
}
