import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowRight } from 'lucide-react'
import { fetchFilteredGalleries, getGalleryEventCounts } from '@/lib/data/queries'
import { GalleryCard } from '@/components/cards/GalleryCard'
import { FilterBar } from '@/components/sections/FilterBar'
import { GalleryCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, PageHeader } from '@/components/ui/Typography'
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

export const revalidate = 60

interface Props {
  searchParams: Promise<{ q?: string; area?: string; type?: string }>
}

async function GalleriesGrid({ searchParams }: Props) {
  const params = await searchParams

  const [{ data: galleries, error: galleriesError }, countMap] = await Promise.all([
    fetchFilteredGalleries({
      q: params.q,
      area: params.area,
      type: params.type,
      featuredSort: true,
    }),
    getGalleryEventCounts(),
  ])

  const galleriesWithCounts = galleries.map((g) => ({
    ...g,
    upcoming_events_count: countMap[g.id] || 0,
  })) as Gallery[]

  if (galleriesError) {
    console.error('[Galleries] Supabase error:', galleriesError.message, galleriesError.details)
  }

  if (galleriesWithCounts.length === 0) {
    return (
      <div>
        <EmptyState title="No galleries found" description="Try adjusting your filters" />
        {process.env.NODE_ENV === 'development' && galleriesError && (
          <p className="mt-4 text-xs text-red-600 max-w-md mx-auto text-center">
            Supabase: {galleriesError.message}
          </p>
        )}
        {process.env.NODE_ENV === 'development' && !galleriesError && (
          <p className="mt-4 text-xs text-ink-400 max-w-md mx-auto text-center">
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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <PageHeader
          eyebrow="Directory"
          title="Gallery Directory"
          description="Discover galleries, museums, and libraries across Dubai and Abu Dhabi."
          className="mb-0"
        />
        <Link
          href="/for-galleries"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gold-500 text-white font-medium hover:bg-gold-600 transition-colors shrink-0 self-start"
        >
          Ask to join
          <ArrowRight size={16} />
        </Link>
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
