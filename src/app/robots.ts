import type { MetadataRoute } from 'next'
import { AI_CRAWLER_AGENTS, SITE_URL } from '@/lib/seo'

const DISALLOWED = ['/admin/', '/api/']

export default function robots(): MetadataRoute.Robots {
  const allowAll = { allow: '/' as const, disallow: DISALLOWED }

  return {
    rules: [
      { userAgent: '*', ...allowAll },
      ...AI_CRAWLER_AGENTS.map((userAgent) => ({ userAgent, ...allowAll })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
