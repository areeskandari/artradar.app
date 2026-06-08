import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { slugify } from '@/lib/utils'

const UA = 'ArtRadarNewsBot/1.0 (+https://artradar.app)'

/** Google News RSS — Dubai / UAE art & culture queries */
const FEED_URLS = [
  'https://news.google.com/rss/search?q=dubai+art+gallery+exhibition&hl=en-AE&gl=AE&ceid=AE:en',
  'https://news.google.com/rss/search?q=UAE+contemporary+art+museum&hl=en-AE&gl=AE&ceid=AE:en',
  'https://news.google.com/rss/search?q=Abu+Dhabi+art+culture&hl=en-AE&gl=AE&ceid=AE:en',
  'https://news.google.com/rss/search?q=Alserkal+art+Dubai&hl=en-AE&gl=AE&ceid=AE:en',
]

const LOCATION_KEYWORDS = [
  'dubai',
  'uae',
  'emirates',
  'abu dhabi',
  'sharjah',
  'alserkal',
  'difc',
]

const ART_KEYWORDS = [
  'art',
  'gallery',
  'galleries',
  'exhibition',
  'museum',
  'artist',
  'biennial',
  'art fair',
  'artfair',
  'cultural',
  'culture',
  'heritage',
  'sculpture',
  'painting',
  'contemporary',
  'curator',
  'artwork',
  'installat',
]

export interface RssItem {
  title: string
  link: string
  description: string
  pubDate: string | null
  sourceName: string | null
  imageUrl: string | null
}

export interface ImportArtNewsResult {
  imported: number
  skipped: number
  errors: string[]
  items: { title: string; slug: string; source_url: string }[]
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
}

function stripHtml(html: string): string {
  return decodeXmlEntities(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTag(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const match = block.match(re)
  return match ? decodeXmlEntities(match[1].trim()) : null
}

function extractSourceName(block: string): string | null {
  const match = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i)
  return match ? stripHtml(match[1]) : null
}

function extractImageUrl(block: string): string | null {
  const patterns = [
    /<media:content[^>]+url=["']([^"']+)["']/i,
    /<media:thumbnail[^>]+url=["']([^"']+)["']/i,
    /<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image/i,
    /<enclosure[^>]+type=["']image[^"']*["'][^>]+url=["']([^"']+)["']/i,
  ]
  for (const re of patterns) {
    const m = block.match(re)
    if (m?.[1]) return m[1]
  }
  return null
}

export function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = []
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) || []

  for (const block of itemBlocks) {
    const title = extractTag(block, 'title')
    const link = extractTag(block, 'link')
    if (!title || !link) continue

    const description = extractTag(block, 'description') || ''
    const pubDate = extractTag(block, 'pubDate')

    items.push({
      title: stripHtml(title),
      link: link.trim(),
      description,
      pubDate,
      sourceName: extractSourceName(block),
      imageUrl: extractImageUrl(block),
    })
  }

  return items
}

function matchesFilters(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()
  const hasLocation = LOCATION_KEYWORDS.some((kw) => text.includes(kw))
  const hasArt = ART_KEYWORDS.some((kw) => text.includes(kw))
  return hasLocation && hasArt
}

function buildContent(summary: string, sourceUrl: string, sourceName: string): string {
  const escapedName = sourceName.replace(/"/g, '&quot;')
  const escapedUrl = sourceUrl.replace(/"/g, '&quot;')
  const body = summary
    ? `<p>${summary.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`
    : ''
  return `${body}<p><a href="${escapedUrl}" target="_blank" rel="noopener noreferrer">Read the full story at ${escapedName} →</a></p>`
}

function parsePublishDate(pubDate: string | null): string {
  if (!pubDate) return new Date().toISOString()
  const parsed = new Date(pubDate)
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
}

async function uniqueSlug(
  supabase: SupabaseClient,
  baseTitle: string,
  sourceUrl: string
): Promise<string> {
  const base = slugify(baseTitle) || 'news-item'
  const suffix = sourceUrl.slice(-8).replace(/[^a-z0-9]/gi, '')
  let candidate = suffix ? `${base}-${suffix}` : base
  let attempt = 0

  while (attempt < 20) {
    const { data } = await supabase.from('news').select('id').eq('slug', candidate).maybeSingle()
    if (!data) return candidate
    attempt += 1
    candidate = `${base}-${attempt}`
  }

  return `${base}-${Date.now()}`
}

const MAX_AGE_DAYS = 7
const MAX_IMPORTS_PER_RUN = 15

async function fetchFeed(url: string): Promise<RssItem[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml' },
    signal: AbortSignal.timeout(20000),
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`Feed ${url} returned ${res.status}`)
  const xml = await res.text()
  return parseRssItems(xml)
}

function isRecentEnough(pubDate: string | null): boolean {
  if (!pubDate) return true
  const parsed = new Date(pubDate)
  if (Number.isNaN(parsed.getTime())) return true
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  return parsed.getTime() >= cutoff
}

function sortByNewest(items: RssItem[]): RssItem[] {
  return [...items].sort((a, b) => {
    const ta = a.pubDate ? new Date(a.pubDate).getTime() : 0
    const tb = b.pubDate ? new Date(b.pubDate).getTime() : 0
    return tb - ta
  })
}

function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function importArtNews(): Promise<ImportArtNewsResult> {
  const supabase = getSupabaseClient()
  const result: ImportArtNewsResult = {
    imported: 0,
    skipped: 0,
    errors: [],
    items: [],
  }

  const seenUrls = new Set<string>()
  const allItems: RssItem[] = []

  const feedResults = await Promise.allSettled(FEED_URLS.map((url) => fetchFeed(url)))
  for (const settled of feedResults) {
    if (settled.status === 'rejected') {
      result.errors.push(settled.reason instanceof Error ? settled.reason.message : String(settled.reason))
      continue
    }
    for (const item of settled.value) {
      if (!seenUrls.has(item.link)) {
        seenUrls.add(item.link)
        allItems.push(item)
      }
    }
  }

  const { data: existingRows } = await supabase
    .from('news')
    .select('source_url')
    .not('source_url', 'is', null)

  const existingSourceUrls = new Set(
    (existingRows || []).map((row) => row.source_url).filter(Boolean) as string[]
  )

  const candidates = sortByNewest(allItems).filter(
    (item) =>
      isRecentEnough(item.pubDate) &&
      matchesFilters(item.title, item.description) &&
      !existingSourceUrls.has(item.link)
  )

  for (const item of candidates) {
    if (result.imported >= MAX_IMPORTS_PER_RUN) break

    const summary = stripHtml(item.description).slice(0, 500)
    const sourceName = item.sourceName || 'original publisher'
    const slug = await uniqueSlug(supabase, item.title, item.link)

    const { error } = await supabase.from('news').insert({
      title: item.title,
      slug,
      content: buildContent(summary, item.link, sourceName),
      cover_image_url: item.imageUrl,
      source_url: item.link,
      source_name: sourceName,
      is_auto_imported: true,
      publish_date: parsePublishDate(item.pubDate),
    })

    if (error) {
      result.errors.push(`${item.title}: ${error.message}`)
      continue
    }

    result.imported += 1
    existingSourceUrls.add(item.link)
    result.items.push({ title: item.title, slug, source_url: item.link })
  }

  result.skipped = allItems.length - result.imported

  return result
}
