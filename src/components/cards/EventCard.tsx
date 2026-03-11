import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, MapPin, Star } from 'lucide-react'
import type { Event } from '@/types'
import { cn, formatDateRange, getPlaceholderImage, isEventActive } from '@/lib/utils'
import { EventTypeBadge } from '@/components/ui/EventTypeBadge'
import { Badge } from '@/components/ui/Badge'

interface EventCardProps {
  event: Event
  className?: string
  variant?: 'default' | 'compact' | 'featured'
  showArtists?: boolean
  showButton?: boolean
}

export function EventCard({ event, className, variant = 'default', showArtists, showButton }: EventCardProps) {
  const imageSrc = event.image_url || getPlaceholderImage('event', event.slug)
  const active = isEventActive(event.start_date, event.end_date)

  if (variant === 'compact') {
    return (
      <Link href={`/events/${event.slug}`} className={cn('group flex gap-3 items-start', className)}>
        <div className="relative w-20 h-16 rounded overflow-hidden shrink-0 bg-ink-100">
          <Image src={imageSrc} alt={event.title} fill className="object-cover" sizes="80px" />
        </div>
        <div className="flex-1 min-w-0">
          <EventTypeBadge type={event.event_type} size="sm" className="mb-1" />
          <h4 className="text-sm font-medium text-ink-900 group-hover:text-gold-600 transition-colors line-clamp-2 leading-tight">
            {event.title}
          </h4>
          <p className="text-xs text-ink-500 mt-0.5">
            {formatDateRange(event.start_date, event.end_date)}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/events/${event.slug}`} className={cn('group block', className)}>
      <div className={cn(
        'bg-white rounded-lg overflow-hidden border card-hover h-full flex flex-col',
        event.is_featured ? 'border-gold-300' : 'border-ink-100',
        active && 'ring-1 ring-teal-300'
      )}>
        {/* Image */}
        <div className="relative overflow-hidden bg-ink-100" style={{ height: variant === 'featured' ? '260px' : '200px' }}>
          <Image
            src={imageSrc}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <EventTypeBadge type={event.event_type} />
            {event.is_featured && <Badge variant="featured"><Star size={10} fill="currentColor" /> Featured</Badge>}
            {active && <Badge className="bg-teal-600 text-white border-teal-700">Live Now</Badge>}
          </div>

          {event.vip_access && (
            <div className="absolute top-3 right-3">
              <Badge variant="vip">VIP</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          <h3 className={cn(
            'font-serif text-ink-900 leading-tight group-hover:text-gold-600 transition-colors line-clamp-2',
            variant === 'featured' ? 'text-xl' : 'text-lg'
          )}>
            {event.title}
          </h3>

          {event.gallery && (
            <p className="text-sm text-ink-500 line-clamp-1">{event.gallery.name}</p>
          )}

          {showArtists && event.artists && event.artists.length > 0 && (
            <p className="text-sm text-ink-600 line-clamp-2">
              {event.artists.map((a) => a.name).join(', ')}
            </p>
          )}

          <div className="flex flex-col gap-1 mt-auto pt-1">
            {(event.start_date || event.end_date) && (
              <div className="flex items-center gap-1.5 text-sm text-ink-600">
                <Calendar size={13} strokeWidth={1.5} className="shrink-0" />
                <span>{formatDateRange(event.start_date, event.end_date)}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-1.5 text-sm text-ink-500">
                <MapPin size={13} strokeWidth={1.5} className="shrink-0" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
          </div>

          {showButton && (
            <span className="mt-3 inline-flex items-center justify-center gap-2 rounded border border-gold-400 bg-gold-50 px-4 py-2 text-sm font-medium text-gold-800 transition-colors group-hover:border-gold-500 group-hover:bg-gold-100">
              View event <ArrowRight size={14} />
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
