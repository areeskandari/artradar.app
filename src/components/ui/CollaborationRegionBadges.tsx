import type { CollaborationRegion } from '@/types'
import { cn, COLLABORATION_REGION_CONFIG } from '@/lib/utils'

interface Props {
  regions: CollaborationRegion[]
  size?: 'sm' | 'md'
  className?: string
}

export function CollaborationRegionBadges({ regions, size = 'md', className }: Props) {
  if (!regions.length) return null

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {regions.map((region) => {
        const config = COLLABORATION_REGION_CONFIG[region]
        if (!config) return null
        return (
          <span
            key={region}
            className={cn(
              'inline-flex items-center rounded border font-bold uppercase tracking-wide',
              config.bg,
              config.color,
              size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
            )}
          >
            {config.label}
          </span>
        )
      })}
    </div>
  )
}
