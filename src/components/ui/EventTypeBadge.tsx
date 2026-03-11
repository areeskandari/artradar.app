import { cn, EVENT_TYPE_CONFIG } from '@/lib/utils'
import type { EventType } from '@/types'

interface EventTypeBadgeProps {
  type: EventType | null
  className?: string
  size?: 'sm' | 'md'
}

export function EventTypeBadge({ type, className, size = 'md' }: EventTypeBadgeProps) {
  if (!type) return null
  const config = EVENT_TYPE_CONFIG[type]

  return (
    <span
      className={cn(
        'inline-flex items-center border font-sans font-medium tracking-wide uppercase',
        size === 'sm' ? 'text-[10px] px-2 py-0.5 rounded' : 'text-xs px-2.5 py-1 rounded',
        config.bg,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  )
}
