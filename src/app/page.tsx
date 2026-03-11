import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Suspense } from 'react'
import { createPublicDataClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/cards/EventCard'
import { GalleryCard } from '@/components/cards/GalleryCard'
import { ArtistCard } from '@/components/cards/ArtistCard'
import { NewsCard } from '@/components/cards/NewsCard'
import { FilterBar } from '@/components/sections/FilterBar'
import { SubscribeForm } from '@/components/sections/SubscribeForm'
import type { Event, Gallery, NewsPost, Artist, EventType } from '@/types'

export const metadata: Metadata = {
  title: "Your Guide to Dubai's Art Scene",
  description: "Discover galleries, exhibitions, artists and events in Dubai's vibrant art scene. This week in Dubai, gallery directory, and art news.",
  openGraph: {
    title: "Art Radar — Your Guide to Dubai's Art Scene",
    description: "Discover galleries, exhibitions, artists and events in Dubai. Gallery directory, events calendar, artist profiles.",
    url: '/',
  },
  alternates: { canonical: '/' },
}

interface HomeSearchParams {
  gallery_q?: string
  gallery_area?: string
  gallery_type?: string
  event_q?: string
  event_area?: string
  event_type?: string
  event_status?: string
}

async function getHomeData(params: HomeSearchParams) {
  const supabase = await createPublicDataClient()
  const now = new Date().toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // 1. This week in Dubai — events that started in the last 7 days
  const { data: thisWeekRaw } = await supabase
    .from('events')
    .select('*, gallery:galleries(id, name, slug, area), event_artists(artist:artists(id, name, slug))')
    .gte('start_date', sevenDaysAgo)
    .lte('start_date', now)
    .order('start_date', { ascending: false })
    .limit(12)

  const thisWeekInDubai = ((thisWeekRaw || []) as (Event & { event_artists?: { artist: { id: string; name: string; slug: string } }[] })[]).map((e) => {
    const { event_artists, ...event } = e
    const artists = (event_artists || []).map((ea) => ea.artist)
    return { ...event, artists } as Event
  })

  // 2. Galleries — filter by search, area, type (Art Gallery, Museum, Library)
  let galleryQuery = supabase
    .from('galleries')
    .select('*')
    .order('name')
  if (params.gallery_q) {
    galleryQuery = galleryQuery.ilike('name', `%${params.gallery_q}%`)
  }
  if (params.gallery_area) {
    galleryQuery = galleryQuery.eq('area', params.gallery_area)
  }
  if (params.gallery_type) {
    galleryQuery = galleryQuery.eq('type', params.gallery_type)
  }
  const { data: galleriesData } = await galleryQuery.limit(24)

  const { data: eventCounts } = await supabase
    .from('events')
    .select('gallery_id')
    .gte('end_date', now)
    .not('gallery_id', 'is', null)
  const countMap: Record<string, number> = {}
  eventCounts?.forEach((e) => {
    if (e.gallery_id) countMap[e.gallery_id] = (countMap[e.gallery_id] || 0) + 1
  })
  const galleries = (galleriesData || []).map((g) => ({
    ...g,
    upcoming_events_count: countMap[g.id] || 0,
  })) as Gallery[]

  // 3. Events — filter by date (status), area, event type
  let eventsQuery = supabase
    .from('events')
    .select('*, gallery:galleries(id, name, slug, area)')
    .order('start_date')
  const status = params.event_status || 'upcoming'
  if (status === 'upcoming') {
    eventsQuery = eventsQuery.gte('start_date', now)
  } else if (status === 'active') {
    eventsQuery = eventsQuery.lte('start_date', now).gte('end_date', now)
  } else if (status === 'past') {
    eventsQuery = eventsQuery.lt('end_date', now).order('end_date', { ascending: false })
  }
  if (params.event_type) {
    eventsQuery = eventsQuery.eq('event_type', params.event_type as EventType)
  }
  if (params.event_q) {
    eventsQuery = eventsQuery.ilike('title', `%${params.event_q}%`)
  }
  if (params.event_area) {
    eventsQuery = eventsQuery.eq('gallery.area', params.event_area)
  }
  const { data: eventsData } = await eventsQuery.limit(24)
  const events = (eventsData || []) as Event[]

  // 4 & 5. Artists (for directory preview on home)
  const { data: artistsData } = await supabase
    .from('artists')
    .select('*')
    .order('name')
    .limit(12)
  const artists = (artistsData || []) as Artist[]

  // 6. News & Updates
  const { data: newsData } = await supabase
    .from('news')
    .select('*, related_gallery:galleries(id, name, slug), related_artist:artists(id, name, slug)')
    .lte('publish_date', now)
    .order('publish_date', { ascending: false })
    .limit(6)
  const news = (newsData || []) as NewsPost[]

  return {
    thisWeekInDubai,
    galleries,
    events,
    artists,
    news,
  }
}

function Section({
  id,
  title,
  subtitle,
  children,
  linkHref,
  linkLabel,
  className = '',
  dark = false,
}: {
  id: string
  title: string
  subtitle?: string
  children: React.ReactNode
  linkHref?: string
  linkLabel?: string
  className?: string
  dark?: boolean
}) {
  return (
    <section id={id} className={`py-12 sm:py-16 px-4 sm:px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className={`font-serif text-3xl ${dark ? 'text-white' : 'text-ink-900'}`}>{title}</h2>
            {subtitle && (
              <p className={`text-sm mt-1 ${dark ? 'text-ink-300' : 'text-ink-500'}`}>{subtitle}</p>
            )}
            <div className="gold-divider w-24 mt-2" />
          </div>
          {linkHref && linkLabel && (
            <Link
              href={linkHref}
              className={`text-sm flex items-center gap-1 shrink-0 ${dark ? 'text-gold-400 hover:text-gold-300' : 'text-gold-600 hover:text-gold-700'}`}
            >
              {linkLabel} <ArrowRight size={14} />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  )
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>
}) {
  const params = await searchParams
  const { thisWeekInDubai, galleries, events, artists, news } = await getHomeData(params)

  return (
    <div className="animate-fade-in">
      {/* 1. This week in Dubai */}
      <Section
        id="this-week"
        title="This week in Dubai"
        subtitle="Events that started in the last 7 days"
        linkHref="/events"
        linkLabel="Full calendar"
        className="bg-ink-50"
      >
        {thisWeekInDubai.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {thisWeekInDubai.map((event) => (
              <EventCard key={event.id} event={event} showArtists showButton />
            ))}
          </div>
        ) : (
          <p className="text-ink-500 text-center py-10">No events started in the last 7 days. Check back soon.</p>
        )}
      </Section>

      {/* 2. Galleries — Directory, Search, Area, Type (Art Gallery, Museum, Library) */}
      <Section
        id="galleries"
        title="Galleries"
        subtitle="Directory · Search · Area · Type (Art Gallery, Museum, Library)"
        linkHref="/galleries"
        linkLabel="Full directory"
        className="bg-white"
      >
        <div className="mb-6">
          <Suspense fallback={null}>
            <FilterBar mode="galleries" basePath="/" paramPrefix="gallery_" />
          </Suspense>
        </div>
        {galleries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {galleries.map((gallery) => (
              <GalleryCard key={gallery.id} gallery={gallery} />
            ))}
          </div>
        ) : (
          <p className="text-ink-500 text-center py-10">No galleries match your filters.</p>
        )}
      </Section>

      {/* 3. Events — All Events, Filter: date, area, event type */}
      <Section
        id="events"
        title="Events"
        subtitle="All events · Filter by date, area, event type"
        linkHref="/events"
        linkLabel="All events"
        className="bg-ink-50"
      >
        <div className="mb-6">
          <Suspense fallback={null}>
            <FilterBar mode="events" basePath="/" paramPrefix="event_" />
          </Suspense>
        </div>
        {events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-ink-500 text-center py-10">No events match your filters.</p>
        )}
      </Section>

      {/* 4. Each Gallery page — grid links to /galleries/[slug]; section 2 already does this */}

      {/* 5. Artists — each card links to /artists/[slug] */}
      <Section
        id="artists"
        title="Artists"
        subtitle="Discover artists in Dubai&rsquo;s art scene"
        linkHref="/artists"
        linkLabel="All artists"
        className="bg-white"
      >
        {artists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        ) : (
          <p className="text-ink-500 text-center py-10">No artists yet.</p>
        )}
      </Section>

      {/* 6. News & Updates — simple blog */}
      <Section
        id="news"
        title="News & Updates"
        subtitle="Stories and updates from the art world"
        linkHref="/news"
        linkLabel="All news"
        className="bg-ink-950"
        dark
      >
        {news.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {news.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-ink-400 text-center py-10">No news yet.</p>
        )}
      </Section>

      {/* Newsletter */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 geometric-bg bg-gold-50 border-t border-gold-200">
        <div className="max-w-xl mx-auto">
          <SubscribeForm
            sourceType="newsletter"
            title="Your Art World, Delivered"
            description="Join the Art Radar newsletter for weekly highlights, opening nights, and exclusive access."
            variant="light"
          />
        </div>
      </section>
    </div>
  )
}
