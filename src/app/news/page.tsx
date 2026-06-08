import type { Metadata } from 'next'
import { createPublicDataClient } from '@/lib/supabase/server'
import { NewsCard } from '@/components/cards/NewsCard'
import { EmptyState, PageHeader } from '@/components/ui/Typography'
import type { NewsPost } from '@/types'

export const metadata: Metadata = {
  title: 'News',
  description: "The latest news from Dubai's art world — gallery openings, artist announcements, exhibitions, and cultural events.",
  keywords: ['Dubai art news', 'art world UAE', 'gallery openings Dubai', 'art announcements'],
  openGraph: {
    title: 'News & Updates | Art Radar',
    description: "The latest news from Dubai's art world — gallery openings, artist announcements, and cultural events.",
    url: '/news',
  },
  alternates: { canonical: '/news' },
  robots: { index: true, follow: true },
}

export default async function NewsPage() {
  const supabase = await createPublicDataClient()
  const now = new Date().toISOString()

  const { data: posts } = await supabase
    .from('news')
    .select('*, related_gallery:galleries(id, name, slug), related_artist:artists(id, name, slug)')
    .lte('publish_date', now)
    .order('publish_date', { ascending: false })
    .limit(20)

  const allPosts = (posts || []) as NewsPost[]
  const [featured, ...rest] = allPosts

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full min-w-0">
      <PageHeader
        eyebrow="Editorial"
        title="News & Updates"
        description="Art world news from Dubai and the wider UAE — openings, announcements, and cultural highlights."
      />

      {featured && (
        <div className="mb-10">
          <NewsCard post={featured} variant="featured" />
        </div>
      )}

      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((post) => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {allPosts.length === 0 && (
        <EmptyState title="No news yet" description="Check back soon for art world updates." />
      )}
    </div>
  )
}
