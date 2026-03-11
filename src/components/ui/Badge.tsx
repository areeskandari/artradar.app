import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'verified' | 'vip' | 'featured' | 'pro' | 'default'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    gold: 'bg-gold-100 text-gold-800 border border-gold-300',
    verified: 'bg-blue-50 text-blue-700 border border-blue-200',
    vip: 'bg-ink-900 text-gold-300 border border-gold-500',
    featured: 'bg-gold-500 text-white border border-gold-600',
    pro: 'bg-ink-800 text-gold-400 border border-gold-600',
    default: 'bg-ink-100 text-ink-700 border border-ink-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
