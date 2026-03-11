import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Globe, Instagram, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'
import { createPublicDataClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/cards/EventCard'
import { ArtistCard } from '@/components/cards/ArtistCard'
import { SubscribeForm } from '@/components/sections/SubscribeForm'
import { Badge } from '@/components/ui/Badge'
import { getPlaceholderImage, isEventActive, isEventUpcoming, stripHtml } from '@/lib/utils'
import type { Event, Artist } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createPublicDataClient()
  const { data: gallery } = await supabase.from('galleries').select('name, description, cover_image_url').eq('slug', slug).single()

  if (!gallery) return {}

  const description = stripHtml(gallery.description)?.slice(0, 160) || `${gallery.name} — Art Radar`
  const imageUrl = gallery.cover_image_url || getPlaceholderImage('gallery', slug)

  return {
    title: gallery.name,
    description,
    openGraph: {
      title: `${gallery.name} | Art Radar`,
      description,
      url: `/galleries/${slug}`,
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: gallery.name }],
    },
    twitter: { card: 'summary_large_image', title: gallery.name, description },
    alternates: { canonical: `/galleries/${slug}` },
  }
}

export default async function GalleryProfilePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createPublicDataClient()

  const { data: gallery } = await supabase
    .from('galleries')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!gallery) notFound()

  const now = new Date().toISOString()

  const [eventsRes, artistsRes] = await Promise.all([
    supabase
      .from('events')
      .select('*, gallery:galleries(id, name, slug)')
      .eq('gallery_id', gallery.id)
      .gte('end_date', now)
      .order('start_date')
      .limit(6),

    supabase
      .from('gallery_artists')
      .select('artist:artists(*)')
      .eq('gallery_id', gallery.id),
  ])

  const events = (eventsRes.data || []) as Event[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const artists = ((artistsRes.data || []).map((r: any) => r.artist)) as Artist[]

  const liveEvents = events.filter((e) => isEventActive(e.start_date, e.end_date))
  const upcomingEvents = events.filter((e) => isEventUpcoming(e.start_date))

  const coverSrc = gallery.cover_image_url || getPlaceholderImage('gallery', gallery.slug)

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="relative h-72 sm:h-96 overflow-hidden bg-ink-900">
        <Image src={coverSrc} alt={gallery.name} fill className="object-cover opacity-80" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />

        {gallery.logo_url && (
          <div className="absolute bottom-6 left-6 w-20 h-20 rounded-lg bg-white shadow-lg overflow-hidden">
            <Image src={gallery.logo_url} alt={`${gallery.name} logo`} fill className="object-contain p-2" />
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-10">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-serif text-4xl text-ink-900">{gallery.name}</h1>
                {gallery.is_featured && <Badge variant="gold">Featured</Badge>}
                {gallery.subscription_active && <Badge variant="verified">Partner</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-ink-500 text-sm mb-4">
                {gallery.type && (
                  <span className="capitalize bg-ink-50 border border-ink-200 px-2 py-0.5 rounded text-ink-600">
                    {gallery.type}
                  </span>
                )}
                {gallery.area && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {gallery.area}
                  </span>
                )}
                {gallery.founded_year && <span>Est. {gallery.founded_year}</span>}
              </div>
              <div className="gold-divider w-24 mb-4" />
              {gallery.description && (
                <div
                  className="prose-art max-w-none"
                  dangerouslySetInnerHTML={{ __html: gallery.description }}
                />
              )}
            </div>

            {/* Live Exhibitions */}
            {liveEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-block w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <h2 className="font-serif text-2xl text-ink-900">On Now</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {liveEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl text-ink-900 mb-4">Upcoming Events</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {/* Artists */}
            {artists.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl text-ink-900 mb-4">Artists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} variant="compact" />
                  ))}
                </div>
              </div>
            )}

            {/* Submission Policy */}
            {gallery.submission_policy && (
              <div className="bg-gold-50 border border-gold-200 rounded-lg p-5">
                <h3 className="font-serif text-xl text-ink-900 mb-2">Submission Policy</h3>
                <p className="text-ink-700 text-sm leading-relaxed">{gallery.submission_policy}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact */}
            <div className="bg-white border border-ink-200 rounded-lg p-5">
              <h3 className="font-medium text-ink-900 mb-4">Contact & Links</h3>
              <div className="space-y-3 text-sm">
                {gallery.address && (
                  <div className="flex items-start gap-2.5 text-ink-600">
                    <MapPin size={15} className="shrink-0 mt-0.5 text-gold-500" />
                    <span>{gallery.address}</span>
                  </div>
                )}
                {gallery.phone && (
                  <a href={`tel:${gallery.phone}`} className="flex items-center gap-2.5 text-ink-600 hover:text-gold-600 transition-colors">
                    <Phone size={15} className="text-gold-500" />
                    <span>{gallery.phone}</span>
                  </a>
                )}
                {gallery.email && (
                  <a href={`mailto:${gallery.email}`} className="flex items-center gap-2.5 text-ink-600 hover:text-gold-600 transition-colors">
                    <Mail size={15} className="text-gold-500" />
                    <span className="truncate">{gallery.email}</span>
                  </a>
                )}
                {gallery.website && (
                  <a href={gallery.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-ink-600 hover:text-gold-600 transition-colors">
                    <Globe size={15} className="text-gold-500" />
                    <span className="truncate">Website</span>
                    <ExternalLink size={11} />
                  </a>
                )}
                {gallery.instagram && (
                  <a href={`https://instagram.com/${gallery.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-ink-600 hover:text-gold-600 transition-colors">
                    <Instagram size={15} className="text-gold-500" />
                    <span>{gallery.instagram}</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>

            {/* Subscribe */}
            <SubscribeForm
              sourceType="gallery"
              sourceId={gallery.id}
              title={`Follow ${gallery.name}`}
              description="Get notified about upcoming exhibitions and events."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
