import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createPublicDataClient } from '@/lib/supabase/server'
import {
  fetchFeaturedGalleries,
  fetchFilteredEvents,
  fetchFilteredGalleries,
  fetchThisWeekEvents,
  getGalleryEventCounts,
  getMapMarkers,
} from '@/lib/data/queries'
import { HomeHeroSection } from '@/components/sections/HomeHeroSection'
import { EventCard } from '@/components/cards/EventCard'
import { GalleryCard } from '@/components/cards/GalleryCard'
import { ArtistCard } from '@/components/cards/ArtistCard'
import { NewsCard } from '@/components/cards/NewsCard'
import { FilterBar } from '@/components/sections/FilterBar'
import { SubscribeForm } from '@/components/sections/SubscribeForm'
import { HomeMapSection } from '@/components/sections/HomeMapSection'
import { SectionHeader } from '@/components/ui/Typography'
import type { Gallery, NewsPost, Artist } from '@/types'

export const revalidate = 60

export const metadata: Metadata = {
  title: "Your Guide to Dubai's Art Scene",
  description: "Discover galleries, exhibitions, artists and events in Dubai's vibrant art scene. This week in Dubai, gallery directory, and art news.",
  keywords: ['Dubai art', 'galleries Dubai', 'art exhibitions Dubai', 'artists UAE', 'DIFC', 'Alserkal Avenue', 'UAE art', 'art events Dubai'],
  openGraph: {
    title: "Art Radar — Your Guide to Dubai's Art Scene",
    description: "Discover galleries, exhibitions, artists and events in Dubai. Gallery directory, events calendar, artist profiles.",
    url: '/',
  },
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
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

  const [
    thisWeekInDubai,
    { data: featuredGalleriesData, error: featuredGalleriesError },
    { data: galleriesData, error: galleriesError },
    events,
    artistsResult,
    newsResult,
    countMap,
    { galleries: mapGalleries, events: mapEvents },
  ] = await Promise.all([
    fetchThisWeekEvents(),
    fetchFeaturedGalleries(6),
    fetchFilteredGalleries({
      q: params.gallery_q,
      area: params.gallery_area,
      type: params.gallery_type,
      limit: 24,
    }),
    fetchFilteredEvents({
      q: params.event_q,
      area: params.event_area,
      event_type: params.event_type,
      status: params.event_status,
      limit: 24,
    }),
    supabase.from('artists').select('*').order('name').limit(12),
    supabase
      .from('news')
      .select('*, related_gallery:galleries(id, name, slug), related_artist:artists(id, name, slug)')
      .lte('publish_date', now)
      .order('publish_date', { ascending: false })
      .limit(6),
    getGalleryEventCounts(),
    getMapMarkers(),
  ])

  const { data: artistsData, error: artistsError } = artistsResult
  const { data: newsData, error: newsError } = newsResult
  const supabaseError =
    featuredGalleriesError?.message ||
    galleriesError?.message ||
    artistsError?.message ||
    newsError?.message ||
    null

  if (supabaseError) {
    console.error('[Home] Supabase error:', supabaseError)
  }

  const withEventCounts = (rows: typeof galleriesData) =>
    rows.map((g) => ({
      ...g,
      upcoming_events_count: countMap[g.id] || 0,
    })) as Gallery[]

  const featuredGalleries = withEventCounts(featuredGalleriesData)
  const galleries = withEventCounts(galleriesData)

  return {
    thisWeekInDubai,
    featuredGalleries,
    galleries,
    events,
    artists: (artistsData || []) as Artist[],
    news: (newsData || []) as NewsPost[],
    mapGalleries,
    mapEvents,
    supabaseError,
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
    <section id={id} className={`py-12 sm:py-16 px-4 sm:px-6 w-full min-w-0 ${className}`}>
      <div className="max-w-7xl mx-auto w-full min-w-0">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          linkHref={linkHref}
          linkLabel={linkLabel}
          dark={dark}
          className="mb-6"
        />
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
  const {
    thisWeekInDubai,
    featuredGalleries,
    galleries,
    events,
    artists,
    news,
    mapGalleries,
    mapEvents,
    supabaseError,
  } = await getHomeData(params)

  return (
    <div className="animate-fade-in w-full min-w-0">
      {process.env.NODE_ENV === 'development' && supabaseError && (
        <div className="bg-destructive/10 border-b border-destructive/30 px-4 py-3 text-sm text-destructive">
          <strong>Supabase connection failed:</strong> {supabaseError}. Check VPN/proxy (Clash fake-ip breaks
          *.supabase.co), then restart <code className="text-xs">npm run dev</code>.
        </div>
      )}

      <HomeHeroSection />

      {/* Top Galleries */}
      <Section
        id="top-galleries"
        title="Top Galleries"
        subtitle="Featured spaces across Dubai&rsquo;s art scene"
        linkHref="/galleries"
        linkLabel="Full directory"
        className="bg-card"
      >
        {featuredGalleries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredGalleries.map((gallery) => (
              <GalleryCard key={gallery.id} gallery={gallery} />
            ))}
          </div>
        ) : (
          <p className="text-ink-500 text-center py-10">No featured galleries yet. Check back soon.</p>
        )}
      </Section>

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
        className="bg-card"
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
        className="bg-card"
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

      {/* Map */}
      <Section
        id="map"
        title="Explore on map"
        subtitle="Galleries and events across Dubai"
        linkHref="/map"
        linkLabel="Full map"
        className="bg-ink-50"
      >
        <HomeMapSection galleries={mapGalleries} events={mapEvents} />
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
