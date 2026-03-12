import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, MapPin, ExternalLink, Star, Ticket } from 'lucide-react'
import { createPublicDataClient } from '@/lib/supabase/server'
import { ArtistCard } from '@/components/cards/ArtistCard'
import { SubscribeForm } from '@/components/sections/SubscribeForm'
import { EventTypeBadge } from '@/components/ui/EventTypeBadge'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getPlaceholderImage, formatDate, formatDateRange, isEventActive, stripHtml } from '@/lib/utils'
import type { Artist, Gallery } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createPublicDataClient()
  const { data: event } = await supabase.from('events').select('title, description, image_url').eq('slug', slug).single()
  if (!event) return {}
  const description = stripHtml(event.description)?.slice(0, 160) || `Event: ${event.title} — Art Radar`
  const imageUrl = event.image_url || getPlaceholderImage('event', slug)
  return {
    title: event.title,
    description,
    openGraph: {
      title: `${event.title} | Art Radar`,
      description,
      url: `/events/${slug}`,
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: event.title }],
    },
    twitter: { card: 'summary_large_image', title: event.title, description },
    alternates: { canonical: `/events/${slug}` },
  }
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createPublicDataClient()

  const { data: event } = await supabase
    .from('events')
    .select('*, gallery:galleries(*)')
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  const { data: artistLinks } = await supabase
    .from('event_artists')
    .select('artist:artists(*)')
    .eq('event_id', event.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const artists = ((artistLinks || []).map((r: any) => r.artist)) as Artist[]

  const gallery = event.gallery as Gallery | null
  const imageSrc = event.image_url || getPlaceholderImage('event', event.slug)
  const active = isEventActive(event.start_date, event.end_date)

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="relative h-64 sm:h-96 overflow-hidden bg-ink-900">
        <Image src={imageSrc} alt={event.title} fill className="object-cover opacity-80" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
        <div className="absolute top-6 left-6 flex flex-wrap gap-2">
          <EventTypeBadge type={event.event_type} />
          {event.is_featured && <Badge variant="featured"><Star size={10} fill="currentColor" /> Featured</Badge>}
          {active && <Badge className="bg-teal-600 text-white border-teal-700">On Now</Badge>}
          {event.vip_access && <Badge variant="vip">VIP</Badge>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full min-w-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 min-w-0">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8 min-w-0">
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 leading-tight mb-3">
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-ink-500 mb-4">
                {gallery && (
                  <Link href={`/galleries/${gallery.slug}`} className="text-gold-600 hover:text-gold-700 font-medium">
                    {gallery.name}
                  </Link>
                )}
                {(event.start_date || event.end_date) && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {formatDateRange(event.start_date, event.end_date)}
                  </span>
                )}
                {event.opening_date && (
                  <span className="flex items-center gap-1.5 text-gold-600">
                    <Star size={13} />
                    Opening: {formatDate(event.opening_date, 'dd MMM, h:mm a')}
                  </span>
                )}
                {event.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} />
                    {event.location}
                  </span>
                )}
              </div>

              <div className="gold-divider w-32 mb-6" />

              {event.description && (
                <div
                  className="prose-art max-w-none"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              )}
            </div>

            {/* Artists */}
            {artists.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl text-ink-900 mb-4">Artists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5 min-w-0">
            {/* Ticket info */}
            <div className="bg-white border border-ink-200 rounded-lg p-5">
              <h3 className="font-medium text-ink-900 mb-3 flex items-center gap-2">
                <Ticket size={16} className="text-gold-500" /> Admission
              </h3>
              <p className="text-sm text-ink-600 mb-4">
                {event.ticket_info || 'Free entry'}
              </p>
              {event.external_link && (
                <a href={event.external_link} target="_blank" rel="noopener noreferrer">
                  <Button variant="gold" className="w-full">
                    Get Tickets / More Info <ExternalLink size={14} />
                  </Button>
                </a>
              )}
            </div>

            {/* Dates */}
            <div className="bg-ink-50 border border-ink-200 rounded-lg p-5 space-y-3 text-sm">
              {event.opening_date && (
                <div>
                  <p className="text-xs text-gold-600 uppercase tracking-wider font-medium mb-0.5">Opening Night</p>
                  <p className="text-ink-800">{formatDate(event.opening_date, 'EEEE dd MMM, h:mm a')}</p>
                </div>
              )}
              {event.start_date && (
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wider font-medium mb-0.5">Exhibition Period</p>
                  <p className="text-ink-800">{formatDateRange(event.start_date, event.end_date)}</p>
                </div>
              )}
              {event.location && (
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wider font-medium mb-0.5">Location</p>
                  <p className="text-ink-800">{event.location}</p>
                </div>
              )}
              {event.lat != null && event.lng != null && (
                <div>
                  <p className="text-xs text-ink-500 uppercase tracking-wider font-medium mb-0.5">Map</p>
                  <a
                    href={`https://www.google.com/maps?q=${event.lat},${event.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-600 hover:underline inline-flex items-center gap-1"
                  >
                    View exact location on map <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* Subscribe */}
            <SubscribeForm
              sourceType="event"
              sourceId={event.id}
              title="Get Event Updates"
              description="Be notified about this event and similar exhibitions."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
