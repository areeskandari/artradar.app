import { NextResponse } from 'next/server'
import { createPublicDataClient } from '@/lib/supabase/server'
import { CHATBOT_SYSTEM_PROMPT } from '@/lib/chat/systemPrompt'

export const runtime = 'nodejs'

type Role = 'user' | 'assistant' | 'system'

type ChatMessage = {
  role: Role
  content: string
}

function compact(s: string | null | undefined, max = 600) {
  const t = (s || '').replace(/\s+/g, ' ').trim()
  if (!t) return ''
  return t.length > max ? `${t.slice(0, max)}…` : t
}

function buildContextBlock(items: { title: string; body: string; url?: string }[]) {
  if (items.length === 0) return 'No relevant records found.'
  return items
    .map((it, i) => {
      const u = it.url ? `\nURL: ${it.url}` : ''
      return `# ${i + 1}. ${it.title}${u}\n${it.body}`.trim()
    })
    .join('\n\n')
}

async function embedQuery(text: string) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY')
  const model = process.env.OPENROUTER_EMBEDDING_MODEL || 'openai/text-embedding-3-small'

  const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, input: text }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message || 'Embeddings request failed')
  const emb = json?.data?.[0]?.embedding
  if (!Array.isArray(emb)) throw new Error('Invalid embedding response')
  return emb as number[]
}

async function retrieveRagContext(query: string) {
  const supabase = await createPublicDataClient()
  const q = query.trim()
  if (!q) return []

  // Vector search against rag_chunks
  const embedding = await embedQuery(q)
  const { data: matches, error } = await supabase.rpc('match_rag_chunks', {
    query_embedding: embedding,
    match_count: 10,
  })

  if (error || !matches || matches.length === 0) return []

  type MatchRow = { document_id: string; chunk_text: string; similarity: number }
  const matchRows = matches as MatchRow[]

  const docIds = Array.from(new Set(matchRows.map((m) => m.document_id))).slice(0, 10)
  const { data: docs } = await supabase
    .from('rag_documents')
    .select('id, title, url, source_type')
    .in('id', docIds)

  type DocRow = { id: string; title: string; url: string | null; source_type: string }
  const docMap = new Map((docs as DocRow[] | null || []).map((d) => [d.id, d]))

  // Build items grouped by document
  const byDoc = new Map<string, { title: string; url?: string; body: string }>()
  for (const m of matchRows) {
    const doc = docMap.get(m.document_id)
    if (!doc) continue
    const key = doc.id
    const title = doc.title
    const url = doc.url || undefined
    const snippet = compact(m.chunk_text, 800)
    const prev = byDoc.get(key)
    byDoc.set(key, {
      title,
      url,
      body: prev ? `${prev.body}\n---\n${snippet}` : snippet,
    })
  }

  return Array.from(byDoc.values()).slice(0, 8)
}

async function retrieveSupabaseContext(query: string) {
  const supabase = await createPublicDataClient()
  const q = query.trim()
  if (!q) return []

  const qLower = q.toLowerCase()
  const wantsCollaborationList =
    qLower.includes('open to collaboration') ||
    qLower.includes('open to collab') ||
    qLower.includes('collaboration') ||
    qLower.includes('collab') ||
    qLower.includes('collaborate')
  const wantsGalleryList =
    qLower.includes('list') &&
    (qLower.includes('gallery') || qLower.includes('galleries')) &&
    (qLower.includes('dubai') || qLower.includes('uae') || qLower.includes('here'))

  const like = `%${q}%`

  const galleriesQuery = wantsGalleryList
    ? supabase
        .from('galleries')
        .select('id, name, slug, area, type, description, address')
        .order('is_featured', { ascending: false })
        .order('subscription_active', { ascending: false })
        .order('name')
        .limit(12)
    : supabase
        .from('galleries')
        .select('id, name, slug, area, type, description, address')
        .or(`name.ilike.${like},description.ilike.${like},address.ilike.${like}`)
        .order('name')
        .limit(8)

  const [galleriesRes, eventsRes, artistsRes, newsRes] = await Promise.all([
    galleriesQuery,
    supabase
      .from('events')
      .select('id, title, slug, event_type, start_date, end_date, location, description')
      .or(`title.ilike.${like},description.ilike.${like},location.ilike.${like}`)
      .order('start_date', { ascending: true })
      .limit(8),
    wantsCollaborationList
      ? supabase
          .from('artists')
          .select('id, name, slug, nationality, city, bio, website, instagram, open_to_collaboration, is_verified, pro_subscription_active')
          .eq('open_to_collaboration', true)
          .order('is_verified', { ascending: false })
          .order('pro_subscription_active', { ascending: false })
          .order('name')
          .limit(12)
      : supabase
          .from('artists')
          .select('id, name, slug, nationality, city, bio, website, instagram, open_to_collaboration')
          .or(`name.ilike.${like},bio.ilike.${like},nationality.ilike.${like},city.ilike.${like}`)
          .order('name')
          .limit(8),
    supabase
      .from('news')
      .select('id, title, slug, publish_date, content')
      .or(`title.ilike.${like},content.ilike.${like}`)
      .order('publish_date', { ascending: false })
      .limit(6),
  ])

  const items: { title: string; body: string; url?: string }[] = []

  for (const g of galleriesRes.data || []) {
    items.push({
      title: `Gallery: ${g.name}`,
      url: `/galleries/${g.slug}`,
      body: [
        g.area ? `Area: ${g.area}` : null,
        g.type ? `Type: ${g.type}` : null,
        g.address ? `Address: ${compact(g.address, 120)}` : null,
        g.description ? `Description: ${compact(g.description)}` : null,
      ].filter(Boolean).join('\n'),
    })
  }

  for (const e of eventsRes.data || []) {
    items.push({
      title: `Event: ${e.title}`,
      url: `/events/${e.slug}`,
      body: [
        e.event_type ? `Type: ${e.event_type}` : null,
        e.start_date ? `Start: ${e.start_date}` : null,
        e.end_date ? `End: ${e.end_date}` : null,
        e.location ? `Location: ${compact(e.location, 120)}` : null,
        e.description ? `Description: ${compact(e.description)}` : null,
      ].filter(Boolean).join('\n'),
    })
  }

  for (const a of artistsRes.data || []) {
    items.push({
      title: `Artist: ${a.name}`,
      url: `/artists/${a.slug}`,
      body: [
        a.nationality ? `Nationality: ${a.nationality}` : null,
        a.city ? `City: ${a.city}` : null,
        typeof a.open_to_collaboration === 'boolean'
          ? `Open to collaboration: ${a.open_to_collaboration ? 'Yes' : 'No'}`
          : null,
        a.website ? `Website: ${a.website}` : null,
        a.instagram ? `Instagram: ${a.instagram}` : null,
        a.bio ? `Bio: ${compact(a.bio)}` : null,
      ].filter(Boolean).join('\n'),
    })
  }

  for (const n of newsRes.data || []) {
    items.push({
      title: `News: ${n.title}`,
      url: `/news/${n.slug}`,
      body: [
        n.publish_date ? `Publish date: ${n.publish_date}` : null,
        n.content ? `Content: ${compact(n.content)}` : null,
      ].filter(Boolean).join('\n'),
    })
  }

  return items.slice(0, 12)
}

async function openRouterChat(opts: {
  system: string
  messages: ChatMessage[]
}) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
      messages: [{ role: 'system', content: opts.system }, ...opts.messages],
      temperature: 0.2,
    }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(json?.error?.message || 'OpenRouter request failed')
  }

  const text = json?.choices?.[0]?.message?.content
  return typeof text === 'string' ? text : ''
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const safeMessages: ChatMessage[] = Array.isArray(messages)
      ? messages
          .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
          .slice(-12)
      : []

    const lastUser = [...safeMessages].reverse().find((m) => m.role === 'user')?.content || ''
    const qLower = lastUser.toLowerCase()
    const wantsCollaborationList =
      qLower.includes('open to collaboration') ||
      qLower.includes('open to collab') ||
      qLower.includes('collaboration') ||
      qLower.includes('collab') ||
      qLower.includes('collaborate')

    let retrieved: { title: string; body: string; url?: string }[] = []
    try {
      retrieved = await retrieveRagContext(lastUser)
    } catch {
      // Ignore — we'll use Supabase fallback below.
    }

    // Always do a structured Supabase lookup for certain intents, and also as a fallback
    // when vector RAG returns nothing.
    if (wantsCollaborationList || retrieved.length === 0) {
      const supabaseItems = await retrieveSupabaseContext(lastUser)
      const key = (it: { title: string; url?: string }) => `${it.title}::${it.url || ''}`
      const seen = new Set(retrieved.map(key))
      for (const it of supabaseItems) {
        const k = key(it)
        if (!seen.has(k)) {
          retrieved.push(it)
          seen.add(k)
        }
      }
    }
    const contextBlock = buildContextBlock(retrieved)

    const system = `${CHATBOT_SYSTEM_PROMPT}\n\n## Context (Supabase)\n${contextBlock}`
    const answer = await openRouterChat({ system, messages: safeMessages })

    return NextResponse.json({ answer, retrievedCount: retrieved.length })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

