import { cn } from '@/lib/utils'

type LogoVariant = 'mark' | 'lockup'

export function Logo({
  variant = 'lockup',
  className,
}: {
  variant?: LogoVariant
  className?: string
}) {
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
          <linearGradient id="dar_grad" x1="6" y1="4" x2="30" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22D3EE" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="32" height="32" rx="10" fill="url(#dar_grad)" />
        <path
          d="M13 11.5h8.1c3.4 0 5.9 2.3 5.9 6.5s-2.5 6.5-5.9 6.5H13V11.5Zm3.2 2.8v7.4h4.6c1.8 0 3.1-1.3 3.1-3.7s-1.3-3.7-3.1-3.7h-4.6Z"
          fill="#0A0A0B"
          fillOpacity="0.92"
        />
        <circle cx="28.2" cy="10.2" r="2.2" fill="#0A0A0B" fillOpacity="0.92" />
      </svg>

      {variant === 'lockup' && (
        <span className="leading-none">
          <span className="block text-sm font-semibold text-ink-900">Art Radar</span>
          <span className="block text-[11px] text-ink-500">Galleries • Events • Artists</span>
        </span>
      )}
    </span>
  )
}

