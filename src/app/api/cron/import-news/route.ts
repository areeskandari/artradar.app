import { NextResponse } from 'next/server'
import { importArtNews } from '@/lib/news/import-art-news'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const auth = request.headers.get('authorization')
  if (auth === `Bearer ${secret}`) return true

  return request.headers.get('x-cron-secret') === secret
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await importArtNews()
    return NextResponse.json({
      ok: true,
      ...result,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
