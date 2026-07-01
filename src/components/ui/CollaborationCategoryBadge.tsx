import type { CollaborationCategory } from '@/types'
import { cn, COLLABORATION_CATEGORY_CONFIG } from '@/lib/utils'

interface Props {
  category: CollaborationCategory | null
  size?: 'sm' | 'md'
  className?: string
}

export function CollaborationCategoryBadge({ category, size = 'md', className }: Props) {
  if (!category) return null
  const config = COLLABORATION_CATEGORY_CONFIG[category]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-chips border font-normal',
        config.bg,
        config.color,
        size === 'sm' ? 'text-caption px-1.5 py-0.5' : 'text-caption px-2 py-0.5',
        className
      )}
    >
      {config.label}
    </span>
  )
}
