import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createPublicDataClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/cards/EventCard'
import { FilterBar } from '@/components/sections/FilterBar'
import { EventCardSkeleton } from '@/components/ui/Skeleton'
import type { Event, EventType } from '@/types'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Find exhibitions, talks, art fairs, workshops, and performances happening in Dubai. Upcoming and past events calendar.',
  keywords: ['art events Dubai', 'exhibitions Dubai', 'art exhibitions', 'Dubai events', 'DIFC exhibitions'],
  openGraph: {
    title: 'Events | Dubai Art Radar',
    description: 'Find exhibitions, talks, art fairs, workshops, and performances happening in Dubai.',
    url: '/events',
  },
  alternates: { canonical: '/events' },
}

interface Props {
  searchParams: Promise<{
    q?: string
    area?: string
    event_type?: string
    status?: string
  }>
}

async function EventsGrid({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createPublicDataClient()
  const now = new Date().toISOString()

  let query = supabase
    .from('events')
    .select('*, gallery:galleries(id, name, slug, area)')
    .order('start_date')

  // Status filter
  const status = params.status || 'upcoming'
  if (status === 'upcoming') {
    query = query.gte('start_date', now)
  } else if (status === 'active') {
    query = query.lte('start_date', now).gte('end_date', now)
  } else if (status === 'past') {
    query = query.lt('end_date', now).order('end_date', { ascending: false })
  }

  if (params.event_type) {
    query = query.eq('event_type', params.event_type as EventType)
  }

  if (params.q) {
    query = query.ilike('title', `%${params.q}%`)
  }

  if (params.area) {
    // Filter via gallery area — need to join; use filter on joined field
    query = query.eq('gallery.area', params.area)
  }

  const { data: events } = await query.limit(24)

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-20 text-ink-500">
        <p className="font-serif text-2xl mb-2">No events found</p>
        <p className="text-sm">Try adjusting your filters or check back soon.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {(events as Event[]).map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}

export default async function EventsPage({ searchParams }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-ink-900 mb-2">Events</h1>
        <p className="text-ink-500">Exhibitions, talks, workshops, and performances across Dubai.</p>
        <div className="gold-divider w-32 mt-3" />
      </div>

      <div className="mb-6">
        <Suspense fallback={null}>
          <FilterBar mode="events" />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        }
      >
        <EventsGrid searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
