'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { KEEP_ON_YOUR_RADAR as EVENT } from '@/lib/keep-on-your-radar'
import { KEEP_ON_YOUR_RADAR_STOPS } from '@/lib/keep-on-your-radar-stops'
import { cn } from '@/lib/utils'

function eventGalleryPhotos() {
  const seen = new Set<string>()
  const photos: { src: string; alt: string }[] = []

  function add(src: string, alt: string) {
    if (!src || seen.has(src)) return
    seen.add(src)
    photos.push({ src, alt })
  }

  for (const photo of EVENT.photos) add(photo.src, photo.alt)
  for (const stop of KEEP_ON_YOUR_RADAR_STOPS) {
    for (const image of stop.images) add(image.src, image.alt)
  }
  add(EVENT.partner.imageSrc, EVENT.partner.imageAlt)

  return photos
}

export function RadarEventPhotos({ className }: { className?: string }) {
  const photos = eventGalleryPhotos()
  const count = photos.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return
      setIndex(((next % count) + count) % count)
    },
    [count]
  )

  useEffect(() => {
    if (count < 2 || paused) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count)
    }, 7000)

    return () => window.clearInterval(timer)
  }, [count, paused])

  if (count === 0) return null

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Event photos"
      className={cn('mx-auto w-full max-w-[280px] sm:max-w-[300px]', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-lg bg-[#E9D8BE] outline outline-1 outline-black/10 aspect-[3/4]">
        <div
          className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {photos.map((photo, i) => (
            <figure key={photo.src} className="relative h-full w-full shrink-0" aria-hidden={i !== index}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                className="absolute inset-0 h-full w-full object-contain"
              />
            </figure>
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/80 text-ink-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Previous photo"
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/80 text-ink-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Next photo"
            >
              <ChevronRight size={16} strokeWidth={1.75} />
            </button>
            <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {photos.map((photo, i) => (
                <button
                  key={photo.src}
                  type="button"
                  onClick={() => goTo(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-[width,background-color] duration-300',
                    i === index ? 'w-6 bg-[#fa6628]' : 'w-1.5 bg-ink-900/30 hover:bg-ink-900/50'
                  )}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === index ? true : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
