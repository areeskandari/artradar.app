import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { KEEP_ON_YOUR_RADAR as EVENT } from '@/lib/keep-on-your-radar'
import { isSpecialEventEnabled } from '@/lib/special-events'
import {
  RadarGalleryPath,
  radarDisplayClass,
} from '@/components/events/RadarEventIdentity'
import { RadarEventPhotos } from '@/components/events/RadarEventPhotos'
import { JsonLd } from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema, SITE_NAME } from '@/lib/seo'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  const enabled = await isSpecialEventEnabled(EVENT.slug)
  if (!enabled) return { title: 'Event unavailable', robots: { index: false, follow: false } }

  return {
    title: EVENT.title,
    description: EVENT.description,
    openGraph: {
      title: `${EVENT.title} | ${SITE_NAME}`,
      description: EVENT.description,
      url: `/events/${EVENT.slug}`,
      type: 'website',
      images: [{ url: EVENT.bannerSrc, width: 675, height: 369, alt: EVENT.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: EVENT.title,
      description: EVENT.description,
    },
    alternates: { canonical: `/events/${EVENT.slug}` },
    robots: { index: true, follow: true },
  }
}

export default async function KeepOnYourRadarPage() {
  if (!(await isSpecialEventEnabled(EVENT.slug))) notFound()

  return (
    <div className="radar-paper w-full min-w-0">
      <JsonLd
        data={[
          {
            '@type': 'Event',
            name: EVENT.title,
            description: EVENT.description,
            startDate: EVENT.startDate,
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            eventStatus: 'https://schema.org/EventScheduled',
            image: absoluteUrl(EVENT.bannerSrc),
            url: absoluteUrl(`/events/${EVENT.slug}`),
            location: {
              '@type': 'Place',
              name: EVENT.locationLabel,
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Alserkal Avenue',
                addressLocality: 'Al Quoz',
                addressRegion: 'Dubai',
                addressCountry: 'AE',
              },
            },
            organizer: {
              '@type': 'Organization',
              name: SITE_NAME,
              url: absoluteUrl('/'),
            },
            offers: {
              '@type': 'Offer',
              url: EVENT.joinUrl,
              availability: 'https://schema.org/InStock',
              price: 0,
              priceCurrency: 'AED',
            },
          },
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Events', path: '/events' },
            { name: EVENT.title, path: `/events/${EVENT.slug}` },
          ]),
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full min-w-0">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5a4030] hover:text-[#fa6628] transition-colors mb-6"
        >
          <ArrowLeft size={14} strokeWidth={2} />
          All events
        </Link>

        <p className="type-eyebrow !text-[#fa6628] mb-3">{EVENT.tagline}</p>
        <h1
          className={`${radarDisplayClass()} text-balance text-[clamp(2.25rem,6vw,3.75rem)] leading-[1.02] tracking-[-0.03em] font-semibold text-[#fa6628] mb-4`}
        >
          {EVENT.title}
        </h1>
        <p className="text-lg sm:text-xl leading-relaxed text-[#3a271c] max-w-2xl">
          {EVENT.eyebrow}
        </p>

        <div className="h-px w-24 bg-[#fa6628]/70 mt-6 mb-10" />

        <RadarEventPhotos className="mb-10" />

        <div>
          <div className="space-y-8 text-[1.0625rem] leading-relaxed text-[#3a271c]">
            <p>Walk with us through Alserkal Avenue, from:</p>
            <RadarGalleryPath />
            <figure className="overflow-hidden rounded-lg outline outline-1 outline-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={EVENT.mapSrc}
                alt={EVENT.mapAlt}
                className="block h-auto w-full"
              />
            </figure>
            <div className="space-y-4">
              <p>One path, five galleries, and we walk it together.</p>
              <p>
                This is Art Radar, a community by{' '}
                <a
                  href={EVENT.communityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#fa6628] hover:text-[#e24e14] transition-colors"
                >
                  @{EVENT.communityHandle}
                </a>
                .
              </p>
              <p>Meet people who live for art.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
