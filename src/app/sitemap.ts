import type { MetadataRoute } from 'next'
import { createPublicDataClient } from '@/lib/supabase/server'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dubaiartradar.com'

export const dynamic = 'force-dynamic'

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
    { url: `${baseUrl}/galleries`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/collaboration/open-calls`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/collaboration/competitions`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]

  let dynamicPages: MetadataRoute.Sitemap = []

  try {
    const supabase = await createPublicDataClient()

    const [artists, events, galleries, news, collaborations] = await Promise.all([
      supabase.from('artists').select('slug, created_at').then((r) => r.data || []),
      supabase.from('events').select('slug, created_at').then((r) => r.data || []),
      supabase.from('galleries').select('slug, created_at').then((r) => r.data || []),
      supabase.from('news').select('slug, publish_date').then((r) => r.data || []),
      supabase.from('collaborations').select('slug, created_at').then((r) => r.data || []),
    ])

    dynamicPages = [
      ...(artists as { slug: string; created_at?: string }[]).map((a) => ({
        url: `${baseUrl}/artists/${a.slug}`,
        lastModified: a.created_at ? new Date(a.created_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...(events as { slug: string; created_at?: string }[]).map((e) => ({
        url: `${baseUrl}/events/${e.slug}`,
        lastModified: e.created_at ? new Date(e.created_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...(galleries as { slug: string; created_at?: string }[]).map((g) => ({
        url: `${baseUrl}/galleries/${g.slug}`,
        lastModified: g.created_at ? new Date(g.created_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
      ...(news as { slug: string; publish_date?: string }[]).map((n) => ({
        url: `${baseUrl}/news/${n.slug}`,
        lastModified: n.publish_date ? new Date(n.publish_date) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...(collaborations as { slug: string; created_at?: string }[]).map((c) => ({
        url: `${baseUrl}/collaboration/${c.slug}`,
        lastModified: c.created_at ? new Date(c.created_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ]
  } catch (e) {
    console.error('[sitemap] Failed to fetch dynamic routes:', e)
  }

  return [...staticPages, ...dynamicPages]
}
