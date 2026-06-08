import { cn } from '@/lib/utils'

type LogoVariant = 'mark' | 'lockup'
type LogoTheme = 'light' | 'dark'

function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn('logo-mark inline-block h-9 w-9 shrink-0', className)}
      aria-hidden
    />
  )
}

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
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />

      {variant === 'lockup' && (
        <span className="leading-none">
          <span className="block text-sm font-semibold text-primary">
            Art Radar
          </span>
          <span
            className={cn(
              'block text-[11px]',
              theme === 'light' ? 'text-muted-foreground' : 'text-ink-400'
            )}
          >
            Galleries • Events • Artists
          </span>
        </span>
      )}
    </span>
  )
}
