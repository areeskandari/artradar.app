import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createPublicDataClient } from '@/lib/supabase/server'
import type { MapGallery, MapEvent } from '@/components/map/MapView'
import type { Event, EventType, Gallery, Collaboration, CollaborationCategory, CollaborationAttachment, CollaborationRegion } from '@/types'

const PUBLIC_REVALIDATE_SECONDS = 60

export const getGalleryEventCounts = unstable_cache(
  async () => {
    const supabase = await createPublicDataClient()
    const now = new Date().toISOString()
    const { data: eventCounts } = await supabase
      .from('events')
      .select('gallery_id')
      .gte('end_date', now)
      .not('gallery_id', 'is', null)

    const countMap: Record<string, number> = {}
    eventCounts?.forEach((e) => {
      if (e.gallery_id) countMap[e.gallery_id] = (countMap[e.gallery_id] || 0) + 1
    })
    return countMap
  },
  ['gallery-event-counts'],
  { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: ['events', 'galleries'] }
)

export const getMapMarkers = unstable_cache(
  async () => {
    const supabase = await createPublicDataClient()
    const now = new Date().toISOString()

    const [mapGalleriesRes, mapEventsRes] = await Promise.all([
      supabase
        .from('galleries')
        .select('id, name, slug, lat, lng, area')
        .not('lat', 'is', null)
        .not('lng', 'is', null),
      supabase
        .from('events')
        .select('id, title, slug, lat, lng, start_date, end_date, event_type')
        .gte('end_date', now)
        .not('lat', 'is', null)
        .not('lng', 'is', null),
    ])

    return {
      galleries: (mapGalleriesRes.data || []) as MapGallery[],
      events: (mapEventsRes.data || []) as MapEvent[],
    }
  },
  ['map-markers'],
  { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: ['map', 'galleries', 'events'] }
)

export const getGalleryBySlug = cache(async (slug: string) => {
  const supabase = await createPublicDataClient()
  const { data } = await supabase.from('galleries').select('*').eq('slug', slug).single()
  return data
})

export const getEventBySlug = cache(async (slug: string) => {
  const supabase = await createPublicDataClient()
  const { data } = await supabase
    .from('events')
    .select('*, gallery:galleries(*)')
    .eq('slug', slug)
    .single()
  return data
})

export const getArtistBySlug = cache(async (slug: string) => {
  const supabase = await createPublicDataClient()
  const { data } = await supabase.from('artists').select('*').eq('slug', slug).single()
  return data
})

export const getNewsBySlug = cache(async (slug: string) => {
  const supabase = await createPublicDataClient()
  const { data } = await supabase
    .from('news')
    .select('*, related_gallery:galleries(*), related_artist:artists(*)')
    .eq('slug', slug)
    .single()
  return data
})

const COLLABORATION_REGIONS = new Set<CollaborationRegion>(['gcc', 'europe', 'usa', 'canada'])

function normalizeCollaborationRow(row: Collaboration & { photos?: unknown; attachments?: unknown; regions?: unknown }): Collaboration {
  const photos = Array.isArray(row.photos) ? row.photos.filter((p): p is string => typeof p === 'string') : []
  const attachments = Array.isArray(row.attachments)
    ? row.attachments.filter((a): a is CollaborationAttachment => {
        if (!a || typeof a !== 'object') return false
        const att = a as CollaborationAttachment
        return typeof att.name === 'string' && typeof att.url === 'string'
      })
    : []
  const regions = Array.isArray(row.regions)
    ? row.regions.filter((r): r is CollaborationRegion => typeof r === 'string' && COLLABORATION_REGIONS.has(r as CollaborationRegion))
    : []
  return { ...row, photos, attachments, regions }
}

export const getCollaborationBySlug = cache(async (slug: string) => {
  const supabase = await createPublicDataClient()
  const { data } = await supabase.from('collaborations').select('*').eq('slug', slug).single()
  return data ? normalizeCollaborationRow(data as Collaboration) : null
})

export async function fetchFilteredCollaborations(params: {
  category?: CollaborationCategory
  region?: CollaborationRegion
  q?: string
  status?: 'open' | 'closed' | 'all'
  limit?: number
}) {
  const supabase = await createPublicDataClient()
  const now = new Date().toISOString()

  let query = supabase.from('collaborations').select('*').order('deadline', { ascending: true, nullsFirst: false })

  if (params.category) query = query.eq('category', params.category)
  if (params.region) query = query.contains('regions', [params.region])
  if (params.q) query = query.ilike('title', `%${params.q}%`)

  const status = params.status || 'open'
  if (status === 'open') {
    query = query.or(`deadline.is.null,deadline.gte.${now}`)
  } else if (status === 'closed') {
    query = query.lt('deadline', now)
  }

  if (params.limit) query = query.limit(params.limit)

  const { data } = await query
  return ((data || []) as Collaboration[]).map(normalizeCollaborationRow)
}

export function normalizeEventRow(
  e: Event & { event_artists?: { artist: { id: string; name: string; slug: string } }[] }
): Event {
  const { event_artists, ...event } = e
  const artists = (event_artists || []).map((ea) => ea.artist)
  return { ...event, artists } as Event
}

export async function fetchThisWeekEvents() {
  const supabase = await createPublicDataClient()
  const now = new Date().toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('events')
    .select('*, gallery:galleries(id, name, slug, area), event_artists(artist:artists(id, name, slug))')
    .gte('start_date', sevenDaysAgo)
    .lte('start_date', now)
    .order('start_date', { ascending: false })
    .limit(12)

  return ((data || []) as Parameters<typeof normalizeEventRow>[0][]).map(normalizeEventRow)
}

export async function fetchThisWeekCollaborations() {
  const supabase = await createPublicDataClient()
  const now = new Date().toISOString()
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data } = await supabase
    .from('collaborations')
    .select('*')
    .not('deadline', 'is', null)
    .gte('deadline', now)
    .lte('deadline', sevenDaysFromNow)
    .order('deadline', { ascending: true })
    .limit(12)

  return ((data || []) as Collaboration[]).map(normalizeCollaborationRow)
}

export async function fetchFeaturedGalleries(limit = 6) {
  const supabase = await createPublicDataClient()
  const { data, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('is_featured', true)
    .order('name')
    .limit(limit)

  return { data: data || [], error }
}

export async function fetchFilteredGalleries(params: {
  q?: string
  area?: string
  type?: string
  limit?: number
  featuredSort?: boolean
}) {
  const supabase = await createPublicDataClient()

  let query = supabase.from('galleries').select('*')
  if (params.featuredSort) {
    query = query
      .order('is_featured', { ascending: false })
      .order('subscription_active', { ascending: false })
  }
  query = query.order('name')

  if (params.q) query = query.ilike('name', `%${params.q}%`)
  if (params.area) query = query.eq('area', params.area)
  if (params.type) query = query.eq('type', params.type)
  if (params.limit) query = query.limit(params.limit)

  const { data, error } = await query
  return { data: data || [], error }
}

export async function fetchFilteredEvents(params: {
  q?: string
  area?: string
  event_type?: string
  status?: string
  limit?: number
}) {
  const supabase = await createPublicDataClient()
  const now = new Date().toISOString()

  let query = supabase
    .from('events')
    .select('*, gallery:galleries(id, name, slug, area)')
    .order('start_date')

  const status = params.status || 'upcoming'
  if (status === 'upcoming') {
    query = query.gte('start_date', now)
  } else if (status === 'active') {
    query = query.lte('start_date', now).gte('end_date', now)
  } else if (status === 'past') {
    query = query.lt('end_date', now).order('end_date', { ascending: false })
  }

  if (params.event_type) query = query.eq('event_type', params.event_type as EventType)
  if (params.q) query = query.ilike('title', `%${params.q}%`)
  if (params.area) query = query.eq('gallery.area', params.area)
  if (params.limit) query = query.limit(params.limit)

  const { data } = await query
  return (data || []) as Event[]
}

export async function fetchForKidsPageData() {
  const supabase = await createPublicDataClient()
  const now = new Date().toISOString()

  const [workshopsRes, kidsEventsRes, kidsGalleriesRes] = await Promise.all([
    supabase
      .from('events')
      .select('*, gallery:galleries(id, name, slug, area)')
      .eq('event_type', 'workshop')
      .gte('start_date', now)
      .order('start_date')
      .limit(24),
    supabase
      .from('events')
      .select('*, gallery:galleries(id, name, slug, area)')
      .eq('is_for_kids', true)
      .neq('event_type', 'workshop')
      .gte('start_date', now)
      .order('start_date')
      .limit(24),
    supabase
      .from('galleries')
      .select('*')
      .eq('is_for_kids', true)
      .order('name')
      .limit(24),
  ])

  return {
    workshops: (workshopsRes.data || []) as Event[],
    kidsEvents: (kidsEventsRes.data || []) as Event[],
    kidsGalleries: (kidsGalleriesRes.data || []) as Gallery[],
  }
}
