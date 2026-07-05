import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock, Star } from 'lucide-react'
import type { Collaboration } from '@/types'
import { cn, formatDate, getPlaceholderImage, isDeadlineOpen } from '@/lib/utils'
import { CollaborationCategoryBadge } from '@/components/ui/CollaborationCategoryBadge'
import { CollaborationRegionBadges } from '@/components/ui/CollaborationRegionBadges'
import { Badge } from '@/components/ui/Badge'

interface CollaborationCardProps {
  collaboration: Collaboration
  className?: string
  variant?: 'default' | 'list'
}

export function CollaborationCard({ collaboration, className, variant = 'default' }: CollaborationCardProps) {
  const imageSrc = collaboration.cover_image_url || getPlaceholderImage('collaboration', collaboration.slug)
  const open = isDeadlineOpen(collaboration.deadline)

  if (variant === 'list') {
    return (
      <Link
        href={`/collaboration/${collaboration.slug}`}
        className={cn(
          'group flex gap-4 sm:gap-6 p-4 sm:p-5 rounded-lg border bg-card card-hover',
          collaboration.is_featured ? 'border-gold-300' : 'border-ink-100',
          !open && 'opacity-80',
          className
        )}
      >
        <div className="relative w-28 sm:w-44 aspect-[4/3] shrink-0 rounded-md overflow-hidden bg-ink-100">
          <Image
            src={imageSrc}
            alt={collaboration.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 112px, 176px"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-2 py-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <CollaborationCategoryBadge category={collaboration.category} size="sm" />
            <CollaborationRegionBadges regions={collaboration.regions} size="sm" />
            {collaboration.is_featured && (
              <Badge variant="featured">
                <Star size={10} fill="currentColor" /> Featured
              </Badge>
            )}
            {!open && <Badge className="bg-ink-700 text-white border-ink-800">Closed</Badge>}
          </div>
          <h3 className="type-card-title group-hover:text-gold-600 transition-colors line-clamp-2 sm:line-clamp-1">
            {collaboration.title}
          </h3>
          {collaboration.deadline && (
            <div className="flex items-center gap-1.5 text-sm text-ink-600">
              <Clock size={13} strokeWidth={1.5} className="shrink-0" />
              <span>
                {open ? 'Deadline: ' : 'Closed: '}
                {formatDate(collaboration.deadline, 'dd MMM yyyy')}
              </span>
            </div>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-700 group-hover:text-gold-800 mt-1">
            View details <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/collaboration/${collaboration.slug}`} className={cn('group block', className)}>
      <div
        className={cn(
          'bg-card rounded-lg overflow-hidden border card-hover h-full flex flex-col',
          collaboration.is_featured ? 'border-gold-300' : 'border-ink-100',
          !open && 'opacity-80'
        )}
      >
        <div className="relative overflow-hidden bg-ink-100" style={{ height: '200px' }}>
          <Image
            src={imageSrc}
            alt={collaboration.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <CollaborationCategoryBadge category={collaboration.category} />
            {collaboration.is_featured && (
              <Badge variant="featured">
                <Star size={10} fill="currentColor" /> Featured
              </Badge>
            )}
            {!open && (
              <Badge className="bg-ink-700 text-white border-ink-800">Closed</Badge>
            )}
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-2">
          <h3 className="type-card-title group-hover:text-gold-600 transition-colors line-clamp-2">
            {collaboration.title}
          </h3>

          <CollaborationRegionBadges regions={collaboration.regions} size="sm" />

          {collaboration.deadline && (
            <div className="flex items-center gap-1.5 text-sm text-ink-600 mt-auto pt-1">
              <Clock size={13} strokeWidth={1.5} className="shrink-0" />
              <span>
                {open ? 'Deadline: ' : 'Closed: '}
                {formatDate(collaboration.deadline, open ? 'dd MMM yyyy' : 'dd MMM yyyy')}
              </span>
            </div>
          )}

          <span className="mt-3 inline-flex items-center justify-center gap-2 rounded border border-gold-400 bg-gold-50 px-4 py-2 text-sm font-medium text-gold-800 transition-colors group-hover:border-gold-500 group-hover:bg-gold-100">
            View details <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  )
}
