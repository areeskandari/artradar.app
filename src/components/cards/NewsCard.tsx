import Link from 'next/link'
import Image from 'next/image'
import type { NewsPost } from '@/types'
import { cn, formatDate, getPlaceholderImage } from '@/lib/utils'

interface NewsCardProps {
  post: NewsPost
  className?: string
  variant?: 'default' | 'featured'
}

export function NewsCard({ post, className, variant = 'default' }: NewsCardProps) {
  const imageSrc = post.cover_image_url || getPlaceholderImage('news', post.slug)

  if (variant === 'featured') {
    return (
      <Link href={`/news/${post.slug}`} className={cn('group block', className)}>
        <div className="relative rounded-lg overflow-hidden h-80">
          <Image src={imageSrc} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-gold-400 text-sm mb-2">{formatDate(post.publish_date)}</p>
            <h2 className="font-serif text-2xl text-white leading-tight group-hover:text-gold-300 transition-colors">
              {post.title}
            </h2>
            {(post.related_gallery || post.related_artist) && (
              <div className="flex items-center gap-2 mt-3">
                {post.related_gallery && (
                  <span className="text-xs text-ink-300 bg-ink-800/80 px-2 py-0.5 rounded">{post.related_gallery.name}</span>
                )}
                {post.related_artist && (
                  <span className="text-xs text-ink-300 bg-ink-800/80 px-2 py-0.5 rounded">{post.related_artist.name}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/news/${post.slug}`} className={cn('group block', className)}>
      <div className="bg-white rounded-lg overflow-hidden border border-ink-100 card-hover h-full flex flex-col">
        <div className="relative h-48 overflow-hidden bg-ink-100">
          <Image
            src={imageSrc}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="p-4 flex-1 flex flex-col gap-2">
          <p className="text-xs text-gold-600 font-medium uppercase tracking-wider">
            {formatDate(post.publish_date)}
          </p>
          <h3 className="font-serif text-lg text-ink-900 leading-tight group-hover:text-gold-600 transition-colors line-clamp-3">
            {post.title}
          </h3>
          {(post.related_gallery || post.related_artist) && (
            <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
              {post.related_gallery && (
                <span className="text-xs text-ink-600 bg-ink-50 border border-ink-200 px-2 py-0.5 rounded">
                  {post.related_gallery.name}
                </span>
              )}
              {post.related_artist && (
                <span className="text-xs text-ink-600 bg-ink-50 border border-ink-200 px-2 py-0.5 rounded">
                  {post.related_artist.name}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
