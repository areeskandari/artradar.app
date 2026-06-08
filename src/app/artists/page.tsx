import type { Metadata } from 'next'
import { createPublicDataClient } from '@/lib/supabase/server'
import { ArtistCard } from '@/components/cards/ArtistCard'
import { EmptyState, PageHeader } from '@/components/ui/Typography'
import type { Artist } from '@/types'

export const metadata: Metadata = {
  title: 'Artists',
  description: "Discover artists in Dubai and the UAE — profiles, exhibitions, galleries, and collaborations. Browse the artist directory.",
  keywords: ['artists Dubai', 'UAE artists', 'Dubai art scene', 'artist directory'],
  openGraph: {
    title: 'Artists | Art Radar',
    description: "Discover artists in Dubai's art scene — profiles, exhibitions, and collaborations.",
    url: '/artists',
  },
  alternates: { canonical: '/artists' },
  robots: { index: true, follow: true },
}

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function ArtistsPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createPublicDataClient()

  let query = supabase.from('artists').select('*').order('name')
  if (params.q) {
    query = query.ilike('name', `%${params.q}%`)
  }
  const { data: artistsData } = await query
  const artists = (artistsData || []) as Artist[]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full min-w-0">
      <PageHeader
        eyebrow="Profiles"
        title="Artists"
        description="Discover artists in Dubai and the UAE — bios, exhibitions, and gallery connections."
      />

      {artists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      ) : (
        <EmptyState title="No artists found" description="Try a different search or check back later." />
      )}
    </div>
  )
}
