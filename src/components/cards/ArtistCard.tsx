import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Users } from 'lucide-react'
import type { Artist } from '@/types'
import { cn, getPlaceholderImage } from '@/lib/utils'

interface ArtistCardProps {
  artist: Artist
  className?: string
  variant?: 'default' | 'compact'
}

export function ArtistCard({ artist, className, variant = 'default' }: ArtistCardProps) {
  const imageSrc = artist.profile_image_url || getPlaceholderImage('artist', artist.slug)

  if (variant === 'compact') {
    return (
      <Link href={`/artists/${artist.slug}`} className={cn('group flex items-center gap-3', className)}>
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-ink-100 shrink-0">
          <Image src={imageSrc} alt={artist.name} fill className="object-cover" sizes="40px" />
        </div>
        <div>
          <p className="text-sm font-medium text-ink-900 group-hover:text-gold-600 transition-colors flex items-center gap-1">
            {artist.name}
            {artist.is_verified && <CheckCircle size={12} className="text-blue-500" />}
          </p>
          <p className="text-xs text-ink-500">{artist.nationality}</p>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/artists/${artist.slug}`} className={cn('group block', className)}>
      <div className="bg-white rounded-lg overflow-hidden border border-ink-100 card-hover">
        {/* Image */}
        <div className="relative h-56 bg-ink-100 overflow-hidden">
          <Image
            src={imageSrc}
            alt={artist.name}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {artist.open_to_collaboration && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1 text-xs bg-green-600/90 text-white px-2 py-0.5 rounded">
                <Users size={10} />
                Open to Collab
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <div className="flex items-center gap-1.5">
            <h3 className="font-medium text-ink-900 group-hover:text-gold-600 transition-colors line-clamp-1">
              {artist.name}
            </h3>
            {artist.is_verified && (
              <CheckCircle size={14} className="text-blue-500 shrink-0" />
            )}
            {artist.pro_subscription_active && (
              <span className="text-[10px] bg-ink-800 text-gold-400 px-1.5 py-0.5 rounded font-medium">PRO</span>
            )}
          </div>
          {(artist.nationality || artist.city) && (
            <p className="text-sm text-ink-500 mt-0.5 line-clamp-1">
              {[artist.nationality, artist.city].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
