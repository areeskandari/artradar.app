'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const DUBAI_CENTER: [number, number] = [25.2048, 55.2708]
const DEFAULT_ZOOM = 11

// Building icon (gallery) - SVG path from Lucide Building2
const BUILDING_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/></svg>'
// Calendar icon (event) - SVG path from Lucide Calendar
const CALENDAR_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>'

function createGalleryIcon() {
  return L.divIcon({
    className: 'custom-marker custom-marker-gallery',
    html: `<div class="marker-pin marker-gallery" title="Gallery">
      <span class="marker-icon">${BUILDING_SVG}</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

function createEventIcon() {
  return L.divIcon({
    className: 'custom-marker custom-marker-event',
    html: `<div class="marker-pin marker-event" title="Event">
      <span class="marker-icon">${CALENDAR_SVG}</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

const galleryIcon = createGalleryIcon()
const eventIcon = createEventIcon()

function MapBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  if (points.length === 0) return null
  const bounds = L.latLngBounds(points)
  map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
  return null
}

export interface MapGallery {
  id: string
  name: string
  slug: string
  lat: number
  lng: number
  area?: string | null
}

export interface MapEvent {
  id: string
  title: string
  slug: string
  lat: number
  lng: number
  start_date: string | null
  end_date: string | null
  event_type?: string | null
}

interface MapViewProps {
  galleries: MapGallery[]
  events: MapEvent[]
  height?: number
}

export function MapView({ galleries, events, height = 500 }: MapViewProps) {
  const allPoints = useMemo(() => {
    const pts: [number, number][] = []
    galleries.forEach((g) => pts.push([g.lat, g.lng]))
    events.forEach((e) => pts.push([e.lat, e.lng]))
    return pts
  }, [galleries, events])

  return (
    <div className="w-full rounded-xl overflow-hidden border border-ink-200 z-0" style={{ height: `${height}px` }}>
      <MapContainer
        center={DUBAI_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {allPoints.length > 0 && <MapBounds points={allPoints} />}

        {galleries.map((g) => (
          <Marker key={`g-${g.id}`} position={[g.lat, g.lng]} icon={galleryIcon}>
            <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
              {g.name}
            </Tooltip>
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-ink-900 mb-1">{g.name}</p>
                {g.area && <p className="text-xs text-ink-500 mb-2">{g.area}</p>}
                <Link
                  href={`/galleries/${g.slug}`}
                  className="inline-block mt-1 px-3 py-1.5 text-sm font-medium rounded bg-gold-700 text-white hover:bg-gold-800 transition-colors"
                >
                  View gallery →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {events.map((e) => (
          <Marker key={`e-${e.id}`} position={[e.lat, e.lng]} icon={eventIcon}>
            <Tooltip direction="top" offset={[0, -12]} opacity={0.95}>
              {e.title}
            </Tooltip>
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-ink-900 mb-1">{e.title}</p>
                {e.start_date && (
                  <p className="text-xs text-ink-500 mb-2">
                    {new Date(e.start_date).toLocaleDateString()}
                    {e.end_date && ` – ${new Date(e.end_date).toLocaleDateString()}`}
                  </p>
                )}
                <Link
                  href={`/events/${e.slug}`}
                  className="inline-block mt-1 px-3 py-1.5 text-sm font-medium rounded bg-gold-700 text-white hover:bg-gold-800 transition-colors"
                >
                  View event →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
