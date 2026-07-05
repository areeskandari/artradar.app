import type { Metadata } from 'next'
import { Suspense } from 'react'
import { fetchFilteredCollaborations } from '@/lib/data/queries'
import { CollaborationCard } from '@/components/cards/CollaborationCard'
import { EmptyState, PageHeader } from '@/components/ui/Typography'

export const metadata: Metadata = {
  title: 'Open Calls',
  description: 'Discover open calls for artists, curators, and creatives in Dubai and the UAE art scene.',
  openGraph: {
    title: 'Open Calls | Art Radar',
    description: 'Discover open calls for artists, curators, and creatives in Dubai.',
    url: '/collaboration/open-calls',
  },
  alternates: { canonical: '/collaboration/open-calls' },
}

export const revalidate = 60

interface Props {
  searchParams: Promise<{ q?: string; status?: string }>
}

async function OpenCallsGrid({ searchParams }: Props) {
  const params = await searchParams
  const status = params.status === 'closed' ? 'closed' : params.status === 'all' ? 'all' : 'open'
  const collaborations = await fetchFilteredCollaborations({
    category: 'open_call',
    q: params.q,
    status,
    limit: 48,
  })

  if (collaborations.length === 0) {
    return (
      <EmptyState
        title="No open calls found"
        description="Check back soon — new opportunities are added regularly."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {collaborations.map((item) => (
        <CollaborationCard key={item.id} collaboration={item} variant="list" />
      ))}
    </div>
  )
}

export default function OpenCallsPage({ searchParams }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full min-w-0">
      <PageHeader
        eyebrow="Collaboration"
        title="Open Calls"
        description="Calls for artists, curators, and creatives — apply before the deadline."
      />
      <Suspense fallback={<div className="text-sm text-ink-500">Loading open calls…</div>}>
        <OpenCallsGrid searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
