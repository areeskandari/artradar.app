import type { Metadata } from 'next'
import { fetchForKidsPageData } from '@/lib/data/queries'
import { EventCard } from '@/components/cards/EventCard'
import { GalleryCard } from '@/components/cards/GalleryCard'
import { EmptyState, PageHeader, SectionHeader } from '@/components/ui/Typography'

export const metadata: Metadata = {
  title: 'For Kids',
  description: 'Family-friendly art events, workshops, and galleries in Dubai — creative experiences for children and families.',
  openGraph: {
    title: 'For Kids | Art Radar',
    description: 'Family-friendly art events, workshops, and galleries in Dubai.',
    url: '/for-kids',
  },
  alternates: { canonical: '/for-kids' },
  robots: { index: true, follow: true },
}

export const revalidate = 60

function EventGrid({ events, emptyTitle }: { events: Parameters<typeof EventCard>[0]['event'][]; emptyTitle: string }) {
  if (events.length === 0) {
    return <EmptyState title={emptyTitle} description="Check back soon for new listings." className="py-12" />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}

export default async function ForKidsPage() {
  const { workshops, kidsEvents, kidsGalleries } = await fetchForKidsPageData()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full min-w-0">
      <PageHeader
        eyebrow="Families"
        title="For Kids"
        description="Workshops, family-friendly events, and galleries welcoming young art lovers across Dubai."
      />

      <section className="mb-14">
        <SectionHeader
          title="Workshops"
          subtitle="Hands-on creative sessions for children and families."
          linkHref="/events?event_type=workshop"
          linkLabel="All workshops"
          className="mb-6"
        />
        <EventGrid events={workshops} emptyTitle="No upcoming workshops" />
      </section>

      <section className="mb-14">
        <SectionHeader
          title="Events for Kids"
          subtitle="Exhibitions, openings, and activities marked as family-friendly."
          linkHref="/events"
          linkLabel="All events"
          className="mb-6"
        />
        <EventGrid events={kidsEvents} emptyTitle="No kid-friendly events yet" />
      </section>

      <section>
        <SectionHeader
          title="Galleries for Kids"
          subtitle="Spaces with programmes and visits suited to young visitors."
          linkHref="/galleries"
          linkLabel="All galleries"
          className="mb-6"
        />
        {kidsGalleries.length === 0 ? (
          <EmptyState title="No kid-friendly galleries yet" description="Check back soon for new listings." className="py-12" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {kidsGalleries.map((gallery) => (
              <GalleryCard key={gallery.id} gallery={gallery} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
