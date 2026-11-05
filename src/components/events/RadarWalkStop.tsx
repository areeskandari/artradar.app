import Link from 'next/link'
import { ArrowLeft, Instagram } from 'lucide-react'
import { KEEP_ON_YOUR_RADAR as EVENT } from '@/lib/keep-on-your-radar'
import type { WalkStop } from '@/lib/keep-on-your-radar-stops'
import { radarDisplayClass } from '@/components/events/RadarEventIdentity'

export function RadarWalkStop({ stop }: { stop: WalkStop }) {
  return (
    <div className="radar-paper w-full min-w-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full min-w-0">
        <Link
          href={`/events/${EVENT.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5a4030] hover:text-[#fa6628] transition-colors mb-6"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          Back to the walk
        </Link>

        <p className="type-eyebrow !text-[#fa6628] mb-3">{EVENT.tagline}</p>
        <h1
          className={`${radarDisplayClass()} text-balance text-[clamp(2rem,5.5vw,3.25rem)] leading-[1.02] tracking-[-0.03em] font-semibold text-[#fa6628] mb-3`}
        >
          {stop.name}
        </h1>
        <p className="text-lg leading-relaxed text-[#3a271c] max-w-2xl mb-4">{stop.exhibitionTitle}</p>
        <a
          href={`https://www.instagram.com/${stop.handle}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#fa6628] hover:text-[#e24e14] transition-colors"
        >
          <Instagram size={14} strokeWidth={2} />
          @{stop.handle}
        </a>

        <div className="h-px w-24 bg-[#fa6628]/70 mt-6 mb-10" />

        {stop.images.length === 1 ? (
          <figure className="mb-10 overflow-hidden rounded-lg outline outline-1 outline-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stop.images[0].src} alt={stop.images[0].alt} className="block h-auto w-full" />
          </figure>
        ) : (
          <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stop.images.map((image) => (
              <figure key={image.src} className="overflow-hidden rounded-lg outline outline-1 outline-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt={image.alt} className="block h-auto w-full" />
              </figure>
            ))}
          </div>
        )}

        <div className="space-y-10 text-[1.0625rem] leading-relaxed text-[#3a271c] max-w-3xl">
          {stop.sections.map((section) => (
            <section key={section.heading}>
              <h2
                className={`${radarDisplayClass()} text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-[#fa6628] mb-4`}
              >
                {section.heading}
              </h2>
              <div className="space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
