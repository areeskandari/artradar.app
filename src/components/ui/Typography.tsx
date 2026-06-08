import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  className?: string
  dark?: boolean
}

export function PageHeader({ title, description, eyebrow, className, dark }: PageHeaderProps) {
  return (
    <header className={cn('mb-8 sm:mb-10', className)}>
      {eyebrow && (
        <p className={cn('type-eyebrow mb-3', dark ? 'text-gold-400' : 'text-primary')}>{eyebrow}</p>
      )}
      <h1 className={cn('type-h1', dark ? 'text-white' : 'text-ink-900')}>{title}</h1>
      {description && (
        <p className={cn('type-lead mt-3 max-w-2xl', dark ? 'text-ink-300' : 'text-ink-600')}>
          {description}
        </p>
      )}
      <div className={cn('gold-divider mt-5', description ? 'w-28' : 'w-20')} />
    </header>
  )
}

interface SectionHeaderProps {
  title: string
  subtitle?: string
  linkHref?: string
  linkLabel?: string
  dark?: boolean
  className?: string
}

export function SectionHeader({ title, subtitle, linkHref, linkLabel, dark, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between flex-wrap gap-3', className)}>
      <div>
        <h2 className={cn('type-section-title', dark ? 'text-white' : 'text-ink-900')}>{title}</h2>
        {subtitle && (
          <p className={cn('type-lead-sm mt-1.5', dark ? 'text-ink-400' : 'text-ink-500')}>{subtitle}</p>
        )}
        <div className="gold-divider w-24 mt-3" />
      </div>
      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          className={cn(
            'type-link shrink-0 mt-1',
            dark ? 'text-gold-400 hover:text-gold-300' : 'text-gold-600 hover:text-gold-700'
          )}
        >
          {linkLabel} <ArrowRight size={14} className="inline -mt-px" />
        </Link>
      )}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  className?: string
  dark?: boolean
}

export function EmptyState({ title, description, className, dark }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-20', dark ? 'text-ink-400' : 'text-ink-500', className)}>
      <p className={cn('type-empty-title mb-2', dark ? 'text-ink-300' : 'text-ink-700')}>{title}</p>
      {description && <p className="type-small">{description}</p>}
    </div>
  )
}

interface DetailTitleProps {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2'
}

export function DetailTitle({ children, className, as: Tag = 'h1' }: DetailTitleProps) {
  return <Tag className={cn(Tag === 'h1' ? 'type-detail-title' : 'type-h2', className)}>{children}</Tag>
}
