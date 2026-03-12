'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { MapGallery, MapEvent } from '@/components/map/MapView'

const MapView = dynamic(() => import('@/components/map/MapView').then((m) => ({ default: m.MapView })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] rounded-xl border border-ink-200 bg-ink-50 flex items-center justify-center">
      <p className="text-ink-500 text-sm">Loading map…</p>
    </div>
  ),
})

interface HomeMapSectionProps {
  galleries: MapGallery[]
  events: MapEvent[]
}

export function HomeMapSection({ galleries, events }: HomeMapSectionProps) {
  return (
    <div className="w-full">
      <MapView galleries={galleries} events={events} height={320} />
      <Link
        href="/map"
        className="inline-flex items-center gap-1 text-sm font-medium text-gold-600 hover:text-gold-700 mt-3"
      >
        View full map <ArrowRight size={14} />
      </Link>
    </div>
  )
}
