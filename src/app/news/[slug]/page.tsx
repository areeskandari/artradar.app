import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getNewsBySlug } from '@/lib/data/queries'
import { GalleryCard } from '@/components/cards/GalleryCard'
import { ArtistCard } from '@/components/cards/ArtistCard'
import { CollaborationCard } from '@/components/cards/CollaborationCard'
import { getPlaceholderImage, formatDate, stripHtml } from '@/lib/utils'
import type { NewsPost, Collaboration } from '@/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getNewsBySlug(slug)
  if (!post) return {}
  const description = stripHtml(post.content)?.slice(0, 160) || `${post.title} — Art Radar`
  const imageUrl = post.cover_image_url || getPlaceholderImage('news', slug)
  return {
    title: post.title,
    description,
    openGraph: {
      title: `${post.title} | Art Radar`,
      description,
      url: `/news/${slug}`,
      type: 'article',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description },
    alternates: { canonical: `/news/${slug}` },
  }
}

export default async function NewsPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getNewsBySlug(slug)

  if (!post) notFound()

  const newsPost = post as NewsPost
  const imageSrc = newsPost.cover_image_url || getPlaceholderImage('news', newsPost.slug)

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="relative h-64 sm:h-96 overflow-hidden bg-ink-900">
        <Image src={imageSrc} alt={newsPost.title} fill className="object-cover opacity-70" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 to-ink-950/20" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 max-w-4xl mx-auto">
          <p className="text-gold-400 text-sm uppercase tracking-widest mb-2">
            {formatDate(newsPost.publish_date)}
          </p>
          <h1 className="type-h1 text-white">
            {newsPost.title}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/news" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to News
        </Link>

        {newsPost.is_auto_imported && newsPost.source_name && (
          <p className="text-sm text-ink-500 mb-6 pb-6 border-b border-ink-100">
            Curated from{' '}
            {newsPost.source_url ? (
              <a
                href={newsPost.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-700 hover:text-gold-900 underline underline-offset-2"
              >
                {newsPost.source_name}
              </a>
            ) : (
              newsPost.source_name
            )}
          </p>
        )}

        {newsPost.content && (
          <div
            className="prose-art max-w-none mb-10"
            dangerouslySetInnerHTML={{ __html: newsPost.content }}
          />
        )}

        {/* Related */}
        {(newsPost.related_gallery || newsPost.related_artist || newsPost.related_collaboration) && (
          <div className="border-t border-ink-200 pt-8 mt-8">
            <h2 className="type-h2 mb-5">Related</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {newsPost.related_gallery && (
                <GalleryCard gallery={newsPost.related_gallery} />
              )}
              {newsPost.related_artist && (
                <ArtistCard artist={newsPost.related_artist} />
              )}
              {newsPost.related_collaboration && (
                <CollaborationCard collaboration={newsPost.related_collaboration as Collaboration} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
