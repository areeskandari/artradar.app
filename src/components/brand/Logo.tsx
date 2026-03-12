'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

type LogoVariant = 'mark' | 'lockup'
type LogoTheme = 'light' | 'dark'

export function Logo({
  variant = 'lockup',
  theme = 'light',
  className,
}: {
  variant?: LogoVariant
  /** Use "dark" on dark backgrounds (e.g. footer) for correct contrast */
  theme?: LogoTheme
  className?: string
}) {
  const gradientId = useId().replace(/:/g, '')
  const markFill = theme === 'dark' ? '#faf8f5' : '#0A0A0B'
  const markOpacity = theme === 'dark' ? 0.95 : 0.92
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="6" y1="4" x2="30" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22D3EE" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="32" height="32" rx="10" fill={`url(#${gradientId})`} />
        <path
          d="M13 11.5h8.1c3.4 0 5.9 2.3 5.9 6.5s-2.5 6.5-5.9 6.5H13V11.5Zm3.2 2.8v7.4h4.6c1.8 0 3.1-1.3 3.1-3.7s-1.3-3.7-3.1-3.7h-4.6Z"
          fill={markFill}
          fillOpacity={markOpacity}
        />
        <circle cx="28.2" cy="10.2" r="2.2" fill={markFill} fillOpacity={markOpacity} />
      </svg>

      {variant === 'lockup' && (
        <span className="leading-none">
          <span className={cn('block text-sm font-semibold', theme === 'light' ? 'text-ink-900' : 'text-cream')}>
            Art Radar
          </span>
          <span className={cn('block text-[11px]', theme === 'light' ? 'text-ink-500' : 'text-ink-400')}>
            Galleries • Events • Artists
          </span>
        </span>
      )}
    </span>
  )
}
