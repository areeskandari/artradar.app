import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Landmark } from 'lucide-react'
import type { Gallery } from '@/types'
import { cn, getPlaceholderImage } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

interface GalleryCardProps {
  gallery: Gallery
  className?: string
}

const TYPE_LABELS: Record<string, string> = {
  gallery: 'Gallery',
  museum: 'Museum',
  library: 'Library',
}

export function GalleryCard({ gallery, className }: GalleryCardProps) {
  const coverSrc = gallery.cover_image_url || getPlaceholderImage('gallery', gallery.slug)

  return (
    <Link href={`/galleries/${gallery.slug}`} className={cn('group block', className)}>
      <div className="bg-white rounded-lg overflow-hidden border border-ink-100 card-hover h-full flex flex-col">
        {/* Cover Image */}
        <div className="relative h-48 overflow-hidden bg-ink-100">
          <Image
            src={coverSrc}
            alt={gallery.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {gallery.is_featured && (
            <div className="absolute top-3 left-3">
              <Badge variant="gold">Featured</Badge>
            </div>
          )}
          {gallery.logo_url && (
            <div className="absolute bottom-3 left-3 w-12 h-12 rounded bg-white shadow-md overflow-hidden">
              <Image src={gallery.logo_url} alt={`${gallery.name} logo`} fill className="object-contain p-1" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-lg text-ink-900 leading-tight group-hover:text-gold-600 transition-colors line-clamp-2">
              {gallery.name}
            </h3>
            {gallery.type && (
              <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-ink-500 bg-ink-50 px-2 py-0.5 rounded border border-ink-200">
                {TYPE_LABELS[gallery.type]}
              </span>
            )}
          </div>

          {gallery.area && (
            <div className="flex items-center gap-1.5 text-sm text-ink-500">
              <MapPin size={13} strokeWidth={1.5} />
              <span>{gallery.area}</span>
            </div>
          )}

          {gallery.upcoming_events_count !== undefined && gallery.upcoming_events_count > 0 && (
            <div className="mt-auto pt-2 flex items-center gap-1.5 text-sm text-gold-600 font-medium">
              <Landmark size={13} />
              <span>{gallery.upcoming_events_count} upcoming event{gallery.upcoming_events_count !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
