import type { Metadata } from 'next'
import { Suspense } from 'react'
import { fetchFilteredCollaborations } from '@/lib/data/queries'
import { CollaborationCard } from '@/components/cards/CollaborationCard'
import { EmptyState, PageHeader } from '@/components/ui/Typography'

export const metadata: Metadata = {
  title: 'Prizes',
  description: 'Art prizes, awards, and grants for artists across Dubai and the UAE.',
  openGraph: {
    title: 'Prizes | Art Radar',
    description: 'Art prizes, awards, and grants for artists across Dubai and the UAE.',
    url: '/collaboration/prizes',
  },
  alternates: { canonical: '/collaboration/prizes' },
}

export const revalidate = 60

interface Props {
  searchParams: Promise<{ q?: string; status?: string }>
}

async function PrizesGrid({ searchParams }: Props) {
  const params = await searchParams
  const status = params.status === 'closed' ? 'closed' : params.status === 'all' ? 'all' : 'open'
  const collaborations = await fetchFilteredCollaborations({
    category: 'prize',
    q: params.q,
    status,
    limit: 48,
  })

  if (collaborations.length === 0) {
    return (
      <EmptyState
        title="No prizes found"
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

export default function PrizesPage({ searchParams }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full min-w-0">
      <PageHeader
        eyebrow="Collaboration"
        title="Prizes"
        description="Art prizes, awards, and grants — apply before the deadline."
      />
      <Suspense fallback={<div className="text-sm text-ink-500">Loading prizes…</div>}>
        <PrizesGrid searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
