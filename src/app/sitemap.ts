import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'
import { createPublicDataClient } from '@/lib/supabase/server'
import { isSpecialEventEnabled } from '@/lib/special-events'
import { KEEP_ON_YOUR_RADAR } from '@/lib/keep-on-your-radar'
import { KEEP_ON_YOUR_RADAR_STOPS } from '@/lib/keep-on-your-radar-stops'

const baseUrl = SITE_URL

export const dynamic = 'force-dynamic'
export const maxDuration = 60

async function fetchTableSlugs(
  table: 'artists' | 'events' | 'galleries' | 'news' | 'collaborations',
  dateField: 'created_at' | 'publish_date'
): Promise<{ slug: string; lastModified?: string }[]> {
  try {
    const supabase = await createPublicDataClient()
    const { data, error } = await supabase.from(table).select(`slug, ${dateField}`)
    if (error) throw error
    return ((data || []) as { slug: string; created_at?: string; publish_date?: string }[]).map((row) => ({
      slug: row.slug,
      lastModified: row[dateField],
    }))
  } catch (e) {
    console.error(`[sitemap] Failed to fetch ${table}:`, e)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/for-galleries`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/for-kids`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/ask`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/artists`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...(await isSpecialEventEnabled(KEEP_ON_YOUR_RADAR.slug)
      ? [
          { url: `${baseUrl}/events/${KEEP_ON_YOUR_RADAR.slug}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
          ...KEEP_ON_YOUR_RADAR_STOPS.map((stop) => ({
            url: `${baseUrl}/events/${KEEP_ON_YOUR_RADAR.slug}/${stop.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          })),
        ]
      : []),
    { url: `${baseUrl}/galleries`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/collaboration/open-calls`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/collaboration/competitions`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/collaboration/prizes`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/map`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/timeline`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/donate`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  const [artists, events, galleries, news, collaborations] = await Promise.all([
    fetchTableSlugs('artists', 'created_at'),
    fetchTableSlugs('events', 'created_at'),
    fetchTableSlugs('galleries', 'created_at'),
    fetchTableSlugs('news', 'publish_date'),
    fetchTableSlugs('collaborations', 'created_at'),
  ])

  const dynamicPages: MetadataRoute.Sitemap = [
    ...artists.map((a) => ({
      url: `${baseUrl}/artists/${a.slug}`,
      lastModified: a.lastModified ? new Date(a.lastModified) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...events.map((e) => ({
      url: `${baseUrl}/events/${e.slug}`,
      lastModified: e.lastModified ? new Date(e.lastModified) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...galleries.map((g) => ({
      url: `${baseUrl}/galleries/${g.slug}`,
      lastModified: g.lastModified ? new Date(g.lastModified) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...news.map((n) => ({
      url: `${baseUrl}/news/${n.slug}`,
      lastModified: n.lastModified ? new Date(n.lastModified) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...collaborations.map((c) => ({
      url: `${baseUrl}/collaboration/${c.slug}`,
      lastModified: c.lastModified ? new Date(c.lastModified) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]

  return [...staticPages, ...dynamicPages]
}
