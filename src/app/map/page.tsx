import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'
import { createPublicDataClient } from '@/lib/supabase/server'
import type { MapGallery, MapEvent } from '@/components/map/MapView'

const MapView = dynamic(() => import('@/components/map/MapView').then((m) => ({ default: m.MapView })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-xl border border-ink-200 bg-ink-50 flex items-center justify-center">
      <p className="text-ink-500">Loading map…</p>
    </div>
  ),
})

export const metadata: Metadata = {
  title: 'Map',
  description: 'Explore galleries and events on the map — Dubai art scene at a glance.',
  keywords: ['Dubai art map', 'galleries map', 'art events map', 'Dubai galleries map'],
  openGraph: {
    title: 'Map | Art Radar',
    description: 'Explore galleries and events on the map.',
    url: '/map',
  },
  alternates: { canonical: '/map' },
  robots: { index: true, follow: true },
}

export default async function MapPage() {
  const supabase = await createPublicDataClient()
  const now = new Date().toISOString()

  const [galleriesRes, eventsRes] = await Promise.all([
    supabase
      .from('galleries')
      .select('id, name, slug, lat, lng, area')
      .not('lat', 'is', null)
      .not('lng', 'is', null),
    supabase
      .from('events')
      .select('id, title, slug, lat, lng, start_date, end_date, event_type')
      .gte('end_date', now)
      .not('lat', 'is', null)
      .not('lng', 'is', null),
  ])

  const galleries = (galleriesRes.data || []) as MapGallery[]
  const events = (eventsRes.data || []) as MapEvent[]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full min-w-0">
      <div className="mb-6">
        <h1 className="font-serif text-4xl text-ink-900 mb-2 flex items-center gap-3">
          <MapPin size={36} className="text-gold-500" />
          Map
        </h1>
        <p className="text-ink-500">Explore galleries and events on the map.</p>
        <div className="gold-divider w-32 mt-3" />
      </div>

      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <span className="inline-flex items-center gap-2 text-ink-600">
          <span className="w-3 h-3 rounded-full bg-[#2563eb] border border-white shadow" />
          Galleries ({galleries.length})
        </span>
        <span className="inline-flex items-center gap-2 text-ink-600">
          <span className="w-3 h-3 rounded-full bg-[#c8891a] border border-white shadow" />
          Events ({events.length})
        </span>
      </div>

      <MapView galleries={galleries} events={events} />

      {(galleries.length === 0 && events.length === 0) && (
        <p className="mt-4 text-ink-500 text-sm">
          No locations to show yet. Add lat/lng to galleries and events in admin, or run the seed script to add mock coordinates.
        </p>
      )}
    </div>
  )
}
