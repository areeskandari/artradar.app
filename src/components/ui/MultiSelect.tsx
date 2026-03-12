'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, X } from 'lucide-react'

export interface MultiSelectOption {
  id: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (ids: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MultiSelect({ options, value, onChange, placeholder = 'Select…', className, disabled }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selected = options.filter((o) => value.includes(o.id))
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full px-3 py-2 text-sm text-left bg-white border border-ink-200 rounded text-ink-900 min-h-[38px] flex items-center justify-between gap-2',
          'focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          open && 'ring-2 ring-gold-400 border-transparent'
        )}
      >
        <span className={cn('truncate', selected.length === 0 && 'text-ink-400')}>
          {selected.length === 0 ? placeholder : `${selected.length} selected`}
        </span>
        <ChevronDown size={14} className={cn('shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded border border-ink-200 bg-white shadow-lg max-h-56 overflow-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-ink-500">No options</div>
          ) : (
            <ul className="py-1">
              {options.map((opt) => (
                <li key={opt.id}>
                  <label className="flex items-center gap-2 px-3 py-2 hover:bg-ink-50 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={value.includes(opt.id)}
                      onChange={() => toggle(opt.id)}
                      className="rounded border-ink-300 text-gold-500 focus:ring-gold-400"
                    />
                    <span className="truncate">{opt.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {selected.length > 0 && selected.length <= 4 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {selected.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-ink-100 text-ink-700 text-xs"
            >
              {s.label}
              <button
                type="button"
                onClick={() => toggle(s.id)}
                className="hover:text-ink-900 p-0.5"
                aria-label={`Remove ${s.label}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
