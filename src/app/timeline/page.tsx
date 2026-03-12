import type { Metadata } from 'next'
import Link from 'next/link'
import { createPublicDataClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/cards/EventCard'
import type { Event } from '@/types'
import { format, addDays, parseISO } from 'date-fns'

export const metadata: Metadata = {
  title: 'Timeline',
  description: 'Art events in Dubai over the next 30 days — exhibitions, talks, workshops, and more.',
  keywords: ['Dubai art timeline', 'events calendar', 'art exhibitions Dubai'],
  openGraph: {
    title: 'Timeline | Art Radar',
    description: 'Art events in Dubai over the next 30 days.',
    url: '/timeline',
  },
  alternates: { canonical: '/timeline' },
  robots: { index: true, follow: true },
}

export default async function TimelinePage() {
  const supabase = await createPublicDataClient()
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')
  const in30Days = format(addDays(now, 30), 'yyyy-MM-dd')

  const { data: events } = await supabase
    .from('events')
    .select('*, gallery:galleries(id, name, slug, area)')
    .gte('end_date', today)
    .lte('start_date', in30Days)
    .order('start_date', { ascending: true })

  const list = (events || []) as Event[]

  const byDay: Record<string, Event[]> = {}
  list.forEach((event) => {
    const start = event.start_date ? format(parseISO(event.start_date), 'yyyy-MM-dd') : ''
    if (!start) return
    if (!byDay[start]) byDay[start] = []
    byDay[start].push(event)
  })

  const sortedDays = Object.keys(byDay).sort()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full min-w-0">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-ink-900 mb-2">Timeline</h1>
        <p className="text-ink-500">Events over the next 30 days.</p>
        <div className="gold-divider w-32 mt-3" />
      </div>

      {sortedDays.length === 0 ? (
        <p className="text-ink-500 py-12">No events in the next 30 days. Check back soon or browse <Link href="/events" className="text-gold-600 hover:underline">all events</Link>.</p>
      ) : (
        <div className="relative">
          {/* Vertical line - roadmap track (centered under pins) */}
          <div
            className="absolute left-[15px] sm:left-5 top-6 bottom-6 w-0.5 bg-gold-200 rounded-full"
            aria-hidden
          />
          {sortedDays.map((day) => (
            <section
              key={day}
              className="relative pl-12 sm:pl-16 pb-8 sm:pb-10 last:pb-0"
            >
              {/* Pin on the line */}
              <div
                className="absolute left-0 top-1.5 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gold-400 bg-cream shadow-sm flex items-center justify-center z-10 ring-4 ring-background"
                aria-hidden
              >
                <span className="text-[10px] sm:text-xs font-semibold text-gold-700">
                  {format(parseISO(day), 'd')}
                </span>
              </div>
              {/* Date + events */}
              <div className="min-w-0">
                <h2 className="font-serif text-lg sm:text-xl text-ink-800 mb-3 sm:mb-4">
                  {format(parseISO(day), 'EEEE, d MMMM yyyy')}
                </h2>
                <ul className="space-y-3">
                  {byDay[day].map((event) => (
                    <li key={event.id}>
                      <EventCard event={event} variant="compact" />
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
