'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { X } from 'lucide-react'
import { cn, GALLERY_AREAS, GALLERY_TYPES, EVENT_TYPES, EVENT_TYPE_CONFIG } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'

interface FilterBarProps {
  mode: 'galleries' | 'events'
  /** When set (e.g. on home), use this prefix for param names to avoid clashes */
  paramPrefix?: string
  /** Base path for the filter (default: /galleries or /events). Use '/' for home. */
  basePath?: string
}

export function FilterBar({ mode, paramPrefix = '', basePath }: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const path = basePath ?? (mode === 'galleries' ? '/galleries' : '/events')

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const prefixedKey = paramPrefix ? `${paramPrefix}${key}` : key
      if (value) {
        params.set(prefixedKey, value)
      } else {
        params.delete(prefixedKey)
      }
      params.delete('page')
      const query = params.toString()
      router.push(query ? `${path}?${query}` : path, { scroll: false })
    },
    [router, searchParams, path, paramPrefix]
  )

  const hasFilters = paramPrefix
    ? Array.from(searchParams.keys()).some((k) => k.startsWith(paramPrefix))
    : searchParams.toString().length > 0

  const clearAll = () => {
    if (!paramPrefix) {
      router.push(path, { scroll: false })
      return
    }
    const params = new URLSearchParams(searchParams.toString())
    Array.from(params.keys()).forEach((k) => {
      if (k.startsWith(paramPrefix)) params.delete(k)
    })
    const query = params.toString()
    router.push(query ? `${path}?${query}` : path, { scroll: false })
  }

  const getParam = (key: string) => searchParams.get(paramPrefix ? `${paramPrefix}${key}` : key) || ''

  return (
    <div className="bg-white border border-ink-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ink-700">Filter</h3>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-ink-500 hover:text-terracotta-600 transition-colors flex items-center gap-1"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[160px]">
          <Input
            placeholder={mode === 'galleries' ? 'Search galleries...' : 'Search events...'}
            value={getParam('q')}
            onChange={(e) => updateParam('q', e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Area filter (both modes) */}
        <div className="min-w-[140px]">
          <Select
            value={getParam('area')}
            onChange={(e) => updateParam('area', e.target.value)}
          >
            <option value="">All Areas</option>
            {GALLERY_AREAS.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </Select>
        </div>

        {/* Type filter */}
        {mode === 'galleries' && (
          <div className="min-w-[130px]">
            <Select
              value={getParam('type')}
              onChange={(e) => updateParam('type', e.target.value)}
            >
              <option value="">All Types</option>
              {GALLERY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === 'gallery' ? 'Art Gallery' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </Select>
          </div>
        )}

        {mode === 'events' && (
          <>
            <div className="min-w-[140px]">
              <Select
                value={getParam('event_type')}
                onChange={(e) => updateParam('event_type', e.target.value)}
              >
                <option value="">All Event Types</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>{EVENT_TYPE_CONFIG[type].label}</option>
                ))}
              </Select>
            </div>

            <div className="min-w-[130px]">
              <Select
                value={getParam('status') || 'upcoming'}
                onChange={(e) => updateParam('status', e.target.value)}
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">On Now</option>
                <option value="past">Past Events</option>
                <option value="all">All Events</option>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {Array.from(searchParams.entries())
            .filter(([key]) => !paramPrefix || key.startsWith(paramPrefix))
            .map(([key, value]) => {
              const rawKey = paramPrefix && key.startsWith(paramPrefix) ? key.slice(paramPrefix.length) : key
              return (
                <button
                  key={key}
                  onClick={() => updateParam(rawKey, '')}
                  className={cn(
                    'inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors',
                    'bg-gold-50 border-gold-300 text-gold-800 hover:bg-gold-100'
                  )}
                >
                  {rawKey}: {value}
                  <X size={10} />
                </button>
              )
            })}
        </div>
      )}
    </div>
  )
}
