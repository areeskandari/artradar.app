import type { Metadata } from 'next'
import { createPublicDataClient } from '@/lib/supabase/server'
import { NewsCard } from '@/components/cards/NewsCard'
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
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-ink-900 mb-2">News & Updates</h1>
        <p className="text-ink-500">Art world news from Dubai and the wider UAE.</p>
        <div className="gold-divider w-32 mt-3" />
      </div>

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
        <div className="text-center py-20 text-ink-500">
          <p className="font-serif text-2xl mb-2">No news yet</p>
          <p className="text-sm">Check back soon for art world updates.</p>
        </div>
      )}
    </div>
  )
}
