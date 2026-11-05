import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { KEEP_ON_YOUR_RADAR as EVENT } from '@/lib/keep-on-your-radar'
import { KEEP_ON_YOUR_RADAR_STOPS, getWalkStop, walkStopPath } from '@/lib/keep-on-your-radar-stops'
import { isSpecialEventEnabled } from '@/lib/special-events'
import { RadarWalkStop } from '@/components/events/RadarWalkStop'
import { JsonLd } from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema, SITE_NAME } from '@/lib/seo'

export const revalidate = 60

export function generateStaticParams() {
  return KEEP_ON_YOUR_RADAR_STOPS.map((stop) => ({ gallery: stop.slug }))
}

interface Props {
  params: Promise<{ gallery: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!(await isSpecialEventEnabled(EVENT.slug))) {
    return { title: 'Event unavailable', robots: { index: false, follow: false } }
  }

  const { gallery } = await params
  const stop = getWalkStop(gallery)
  if (!stop) return { title: 'Gallery stop', robots: { index: false, follow: false } }

  return {
    title: `${stop.name} · ${EVENT.title}`,
    description: stop.description,
    openGraph: {
      title: `${stop.name} | ${SITE_NAME}`,
      description: stop.description,
      url: walkStopPath(stop.slug),
      type: 'website',
      images: stop.images[0]
        ? [{ url: stop.images[0].src, alt: stop.images[0].alt }]
        : [{ url: EVENT.bannerSrc, alt: EVENT.title }],
    },
    alternates: { canonical: walkStopPath(stop.slug) },
    robots: { index: true, follow: true },
  }
}

export default async function WalkGalleryStopPage({ params }: Props) {
  if (!(await isSpecialEventEnabled(EVENT.slug))) notFound()

  const { gallery } = await params
  const stop = getWalkStop(gallery)
  if (!stop) notFound()

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Events', path: '/events' },
          { name: EVENT.title, path: `/events/${EVENT.slug}` },
          { name: stop.name, path: walkStopPath(stop.slug) },
        ])}
      />
      <RadarWalkStop stop={stop} />
    </>
  )
}
