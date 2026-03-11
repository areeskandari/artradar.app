import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type SourceType = 'gallery' | 'event' | 'artist' | 'news'

function chunkText(text: string, maxChars = 900) {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned) return []
  const parts: string[] = []

  // Split on paragraph-ish boundaries first
  const paras = cleaned.split(/(?:\\n\\s*\\n|\\r\\n\\r\\n)+/g)
  for (const p of paras) {
    if (!p.trim()) continue
    if (p.length <= maxChars) {
      parts.push(p.trim())
      continue
    }
    // Fallback: sentence-ish chunking
    const sentences = p.split(/(?<=[.!?])\\s+/g)
    let buf = ''
    for (const s of sentences) {
      if ((buf + ' ' + s).trim().length > maxChars) {
        if (buf.trim()) parts.push(buf.trim())
        buf = s
      } else {
        buf = (buf ? buf + ' ' : '') + s
      }
    }
    if (buf.trim()) parts.push(buf.trim())
  }

  // Final hard split if something is still too big
  const final: string[] = []
  for (const p of parts) {
    if (p.length <= maxChars) final.push(p)
    else {
      for (let i = 0; i < p.length; i += maxChars) final.push(p.slice(i, i + maxChars))
    }
  }
  return final
}

async function embedBatch(texts: string[]) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY')

  const model = process.env.OPENROUTER_EMBEDDING_MODEL || 'openai/text-embedding-3-small'

  const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: texts,
    }),
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message || 'OpenRouter embeddings failed')

  const data = json?.data
  if (!Array.isArray(data)) throw new Error('Unexpected embeddings response')

  return data.map((d: { embedding: number[] }) => d.embedding)
}

export async function POST(req: Request) {
  // AuthZ: super_admin only
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('admin_profiles').select('role').eq('id', user.id).maybeSingle()
  if (!profile || profile.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const sourceType = body?.sourceType as SourceType | undefined
  const limit = Math.min(Number(body?.limit || 50), 200)

  const admin = await createAdminClient()

  let query = admin.from('rag_documents').select('id, source_type, title, url, content, updated_at').order('updated_at', { ascending: false })
  if (sourceType) query = query.eq('source_type', sourceType)
  const { data: docs, error } = await query.limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let processed = 0
  let chunksInserted = 0

  for (const doc of docs || []) {
    const text = `${doc.title}\n${doc.url ? `URL: ${doc.url}\n` : ''}${doc.content}`
    const chunks = chunkText(text, 900).slice(0, 24)
    if (chunks.length === 0) continue

    // delete existing chunks for doc (fresh reindex)
    await admin.from('rag_chunks').delete().eq('document_id', doc.id)

    // embed in small batches
    const embeddings: number[][] = []
    const batchSize = 16
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)
      const embs = await embedBatch(batch)
      embeddings.push(...embs)
    }

    const rows = chunks.map((chunk_text, idx) => ({
      document_id: doc.id,
      chunk_index: idx,
      chunk_text,
      embedding: embeddings[idx],
    }))

    const { error: insertErr } = await admin.from('rag_chunks').insert(rows)
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

    processed += 1
    chunksInserted += rows.length
  }

  return NextResponse.json({ processed, chunksInserted })
}

