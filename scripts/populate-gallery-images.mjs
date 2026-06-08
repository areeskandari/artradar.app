#!/usr/bin/env node
/**
 * Populate gallery cover_image_url (main) and logo_url (thumbnail) by sourcing
 * images from Google Places (if GOOGLE_MAPS_API_KEY is set), website og:image,
 * or image search fallback.
 *
 * Usage: node scripts/populate-gallery-images.mjs [--dry-run] [--force]
 */

import dns from 'dns'
import dnsPromises from 'dns/promises'
import { Agent, setGlobalDispatcher } from 'undici'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

dns.setServers(['8.8.8.8', '1.1.1.1'])
dns.setDefaultResultOrder('ipv4first')
setGlobalDispatcher(
  new Agent({
    connect: {
      lookup(hostname, options, callback) {
        dnsPromises
          .resolve4(hostname)
          .then((addresses) => {
            if (!addresses.length) {
              callback(new Error(`No A records for ${hostname}`), null)
              return
            }
            if (options.all) {
              callback(null, addresses.map((address) => ({ address, family: 4 })))
            } else {
              callback(null, addresses[0], 4)
            }
          })
          .catch((err) => callback(err, null))
      },
    },
  })
)

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const path = resolve(root, file)
    if (!existsSync(path)) continue
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY

const dryRun = process.argv.includes('--dry-run')
const force = process.argv.includes('--force')

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function normalizeUrl(url) {
  if (!url) return null
  url = url.trim()
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`
  return url
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function getOgImage(url) {
  url = normalizeUrl(url)
  if (!url) return null
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': UA, Accept: 'text/html' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    const html = await res.text()
    const patterns = [
      /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
      /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
    ]
    for (const p of patterns) {
      const m = html.match(p)
      if (m) return m[1].replace(/&amp;/g, '&')
    }
  } catch {
    /* ignore */
  }
  return null
}

async function getGooglePlacesImage(gallery) {
  if (!GOOGLE_KEY) return null
  const query = [gallery.name.trim(), gallery.address?.trim() || 'Dubai UAE'].filter(Boolean).join(', ')
  try {
    const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_KEY,
        'X-Goog-FieldMask': 'places.photos',
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
      signal: AbortSignal.timeout(15000),
    })
    if (!searchRes.ok) return null
    const searchData = await searchRes.json()
    const photoName = searchData.places?.[0]?.photos?.[0]?.name
    if (!photoName) return null

    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=1200&maxWidthPx=1200&key=${GOOGLE_KEY}`
    const photoRes = await fetch(photoUrl, { redirect: 'follow', signal: AbortSignal.timeout(20000) })
    if (!photoRes.ok) return null
    const buf = Buffer.from(await photoRes.arrayBuffer())
    if (buf.length < 1000) return null
    return { buffer: buf, source: 'google-places' }
  } catch {
    return null
  }
}

async function getDdgImage(query) {
  try {
    const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`
    const page = await fetch(searchUrl, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(12000) })
    const html = await page.text()
    const vqd = html.match(/vqd=([^&"']+)/)?.[1] || html.match(/vqd":"([^"]+)"/)?.[1]
    if (!vqd) return null
    await sleep(400)
    const imgRes = await fetch(
      `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}`,
      { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(12000) }
    )
    const data = await imgRes.json()
    const url = data.results?.[0]?.image || data.results?.[0]?.thumbnail
    return url || null
  } catch {
    return null
  }
}

async function downloadImage(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': UA, Accept: 'image/*,*/*' },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('text/html')) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 1000) return null
    return buf
  } catch {
    return null
  }
}

function searchQueries(gallery) {
  const name = gallery.name.trim().replace(/\s+/g, ' ')
  const address = gallery.address?.trim().replace(/\s+/g, ' ') || ''
  const queries = [
    `${name} Dubai UAE art gallery`,
    `${name} Dubai exterior`,
    address ? `${name} ${address}` : null,
    `${name} Alserkal Avenue Dubai`,
    `${name} DIFC Dubai`,
    name,
  ].filter(Boolean)
  return [...new Set(queries)]
}

async function findImage(gallery) {
  const google = await getGooglePlacesImage(gallery)
  if (google) return google

  const og = await getOgImage(gallery.website)
  if (og) {
    const buf = await downloadImage(og)
    if (buf) return { buffer: buf, source: 'website-og' }
  }

  for (const query of searchQueries(gallery)) {
    const ddgUrl = await getDdgImage(query)
    if (ddgUrl) {
      const buf = await downloadImage(ddgUrl)
      if (buf) return { buffer: buf, source: 'image-search' }
    }
    await sleep(350)
  }

  return null
}

async function processImage(buffer) {
  const cover = await sharp(buffer)
    .rotate()
    .resize({ width: 1200, height: 800, fit: 'cover', position: 'centre' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer()

  const thumb = await sharp(buffer)
    .rotate()
    .resize({ width: 200, height: 200, fit: 'cover', position: 'centre' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer()

  return { cover, thumb }
}

async function uploadGalleryImages(galleryId, cover, thumb) {
  const coverPath = `gallery/${galleryId}/cover.jpg`
  const thumbPath = `gallery/${galleryId}/thumb.jpg`
  const bucket = 'gallery-images'

  const { error: coverErr } = await supabase.storage.from(bucket).upload(coverPath, cover, {
    upsert: true,
    contentType: 'image/jpeg',
    cacheControl: '31536000',
  })
  if (coverErr) throw new Error(`cover upload: ${coverErr.message}`)

  const { error: thumbErr } = await supabase.storage.from(bucket).upload(thumbPath, thumb, {
    upsert: true,
    contentType: 'image/jpeg',
    cacheControl: '31536000',
  })
  if (thumbErr) throw new Error(`thumb upload: ${thumbErr.message}`)

  const coverUrl = supabase.storage.from(bucket).getPublicUrl(coverPath).data.publicUrl
  const thumbUrl = supabase.storage.from(bucket).getPublicUrl(thumbPath).data.publicUrl
  return { coverUrl, thumbUrl }
}

async function main() {
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}${force ? ' (force)' : ''}`)
  console.log(`Google Places: ${GOOGLE_KEY ? 'enabled' : 'disabled (set GOOGLE_MAPS_API_KEY to prefer Google Maps photos)'}`)

  let query = supabase.from('galleries').select('id,name,slug,address,website,cover_image_url,logo_url').order('name')
  if (!force) {
    query = query.or('cover_image_url.is.null,logo_url.is.null')
  }

  const { data: galleries, error } = await query
  if (error) {
    console.error('Failed to fetch galleries:', error.message)
    process.exit(1)
  }

  console.log(`Processing ${galleries.length} galleries...\n`)

  const results = { ok: 0, skip: 0, fail: 0 }
  const failed = []

  for (let i = 0; i < galleries.length; i++) {
    const g = galleries[i]
    const prefix = `[${i + 1}/${galleries.length}] ${g.name.trim()}`

    if (!force && g.cover_image_url && g.logo_url) {
      console.log(`${prefix} — skip (already has images)`)
      results.skip++
      continue
    }

    try {
      const found = await findImage(g)
      if (!found) {
        console.log(`${prefix} — no image found`)
        failed.push(g.name.trim())
        results.fail++
        await sleep(500)
        continue
      }

      const { cover, thumb } = await processImage(found.buffer)

      if (dryRun) {
        console.log(`${prefix} — found via ${found.source} (cover ${cover.length}b, thumb ${thumb.length}b)`)
        results.ok++
        await sleep(400)
        continue
      }

      const { coverUrl, thumbUrl } = await uploadGalleryImages(g.id, cover, thumb)
      const { error: updateErr } = await supabase
        .from('galleries')
        .update({ cover_image_url: coverUrl, logo_url: thumbUrl })
        .eq('id', g.id)

      if (updateErr) throw new Error(updateErr.message)

      console.log(`${prefix} — ✓ ${found.source}`)
      results.ok++
    } catch (err) {
      console.log(`${prefix} — error: ${err.message}`)
      failed.push(g.name.trim())
      results.fail++
    }

    await sleep(600)
  }

  console.log('\n--- Summary ---')
  console.log(results)
  if (failed.length) {
    console.log('\nFailed / not found:')
    failed.forEach((n) => console.log(`  - ${n}`))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
