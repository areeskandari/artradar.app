import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createPublicDataClient } from '@/lib/supabase/server'
import { GalleryCard } from '@/components/cards/GalleryCard'
import { FilterBar } from '@/components/sections/FilterBar'
import { GalleryCardSkeleton } from '@/components/ui/Skeleton'
import type { Gallery } from '@/types'

export const metadata: Metadata = {
  title: 'Gallery Directory',
  description: "Explore Dubai's finest art galleries, museums, and libraries — DIFC, Alserkal Avenue, Downtown, Abu Dhabi. Filter by area and type.",
  keywords: ['galleries Dubai', 'DIFC galleries', 'Alserkal Avenue', 'art galleries UAE', 'Dubai museums'],
  openGraph: {
    title: 'Gallery Directory | Art Radar',
    description: "Explore Dubai's finest art galleries, museums, and libraries — from DIFC to Alserkal Avenue.",
    url: '/galleries',
  },
  alternates: { canonical: '/galleries' },
  robots: { index: true, follow: true },
}

interface Props {
  searchParams: Promise<{ q?: string; area?: string; type?: string }>
}

async function GalleriesGrid({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createPublicDataClient()

  let query = supabase
    .from('galleries')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('subscription_active', { ascending: false })
    .order('name')

  if (params.q) {
    query = query.ilike('name', `%${params.q}%`)
  }
  if (params.area) {
    query = query.eq('area', params.area)
  }
  if (params.type) {
    query = query.eq('type', params.type)
  }

  const { data: galleries, error: galleriesError } = await query

  if (galleriesError) {
    console.error('[Galleries] Supabase error:', galleriesError.message, galleriesError.details)
  }

  // Count upcoming events per gallery
  const now = new Date().toISOString()
  const { data: eventCounts } = await supabase
    .from('events')
    .select('gallery_id')
    .gte('end_date', now)
    .not('gallery_id', 'is', null)

  const countMap: Record<string, number> = {}
  eventCounts?.forEach((e) => {
    if (e.gallery_id) countMap[e.gallery_id] = (countMap[e.gallery_id] || 0) + 1
  })

  const galleriesWithCounts = (galleries || []).map((g) => ({
    ...g,
    upcoming_events_count: countMap[g.id] || 0,
  })) as Gallery[]

  if (galleriesWithCounts.length === 0) {
    return (
      <div className="text-center py-20 text-ink-500">
        <p className="font-serif text-2xl mb-2">No galleries found</p>
        <p className="text-sm">Try adjusting your filters</p>
        {process.env.NODE_ENV === 'development' && galleriesError && (
          <p className="mt-4 text-xs text-red-600 max-w-md mx-auto">
            Supabase: {galleriesError.message}
          </p>
        )}
        {process.env.NODE_ENV === 'development' && !galleriesError && (
          <p className="mt-4 text-xs text-ink-400 max-w-md mx-auto">
            If data exists in Supabase: add SUPABASE_SERVICE_ROLE_KEY to .env.local (Project Settings → API → service_role), then restart the dev server.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {galleriesWithCounts.map((gallery) => (
        <GalleryCard key={gallery.id} gallery={gallery} />
      ))}
    </div>
  )
}

export default async function GalleriesPage({ searchParams }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full min-w-0">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-ink-900 mb-2">Gallery Directory</h1>
        <p className="text-ink-500">Discover galleries, museums, and libraries across Dubai and Abu Dhabi.</p>
        <div className="gold-divider w-32 mt-3" />
      </div>

      <div className="mb-6">
        <Suspense fallback={null}>
          <FilterBar mode="galleries" />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <GalleryCardSkeleton key={i} />)}
          </div>
        }
      >
        <GalleriesGrid searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
