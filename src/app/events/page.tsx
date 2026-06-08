import type { Metadata } from 'next'
import { Suspense } from 'react'
import { fetchFilteredEvents } from '@/lib/data/queries'
import { EventCard } from '@/components/cards/EventCard'
import { FilterBar } from '@/components/sections/FilterBar'
import { EventCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, PageHeader } from '@/components/ui/Typography'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Find exhibitions, talks, art fairs, workshops, and performances happening in Dubai. Upcoming and past events calendar.',
  keywords: ['art events Dubai', 'exhibitions Dubai', 'art exhibitions', 'Dubai events', 'DIFC exhibitions'],
  openGraph: {
    title: 'Events | Art Radar',
    description: 'Find exhibitions, talks, art fairs, workshops, and performances happening in Dubai.',
    url: '/events',
  },
  alternates: { canonical: '/events' },
  robots: { index: true, follow: true },
}

export const revalidate = 60

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
  const events = await fetchFilteredEvents({
    q: params.q,
    area: params.area,
    event_type: params.event_type,
    status: params.status,
    limit: 24,
  })

  if (events.length === 0) {
    return (
      <EmptyState title="No events found" description="Try adjusting your filters or check back soon." />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}

export default async function EventsPage({ searchParams }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full min-w-0">
      <PageHeader
        eyebrow="Calendar"
        title="Events"
        description="Exhibitions, talks, workshops, and performances across Dubai."
      />

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
