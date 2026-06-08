#!/usr/bin/env node
/**
 * Populate artist profile_image_url from Wikipedia, website og:image, or image search.
 *
 * Usage: node scripts/populate-artist-images.mjs [--dry-run] [--force]
 */

import dns from 'dns'
import dnsPromises from 'dns/promises'
import { Agent, setGlobalDispatcher } from 'undici'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Avoid broken local DNS proxies (e.g. VPN) that break Supabase TLS.
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

async function getWikipediaImage(artist) {
  const queries = [
    `${artist.name.trim()} artist`,
    `${artist.name.trim()} ${artist.nationality || ''} artist`.trim(),
    artist.name.trim(),
  ]
  for (const q of queries) {
    try {
      const params = new URLSearchParams({
        action: 'query',
        generator: 'search',
        gsrsearch: q,
        gsrlimit: '3',
        prop: 'pageimages',
        piprop: 'thumbnail',
        pithumbsize: '800',
        format: 'json',
        origin: '*',
      })
      const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
        signal: AbortSignal.timeout(12000),
      })
      if (!res.ok) continue
      const data = await res.json()
      const pages = data.query?.pages
      if (!pages) continue
      for (const page of Object.values(pages)) {
        const thumb = page.thumbnail?.source
        if (thumb) return thumb
      }
    } catch {
      /* ignore */
    }
    await sleep(300)
  }
  return null
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
    return data.results?.[0]?.image || data.results?.[0]?.thumbnail || null
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

function searchQueries(artist) {
  const name = artist.name.trim().replace(/\s+/g, ' ')
  const nationality = artist.nationality?.trim()
  const city = artist.city?.trim()
  return [
    ...new Set(
      [
        `${name} artist portrait`,
        `${name} contemporary artist`,
        nationality ? `${name} ${nationality} artist` : null,
        city ? `${name} ${city} artist` : null,
        `${name} artist photo`,
        name,
      ].filter(Boolean)
    ),
  ]
}

async function findImage(artist) {
  const wikiUrl = await getWikipediaImage(artist)
  if (wikiUrl) {
    const buf = await downloadImage(wikiUrl)
    if (buf) return { buffer: buf, source: 'wikipedia' }
  }

  const og = await getOgImage(artist.website)
  if (og) {
    const buf = await downloadImage(og)
    if (buf) return { buffer: buf, source: 'website-og' }
  }

  for (const query of searchQueries(artist)) {
    const ddgUrl = await getDdgImage(query)
    if (ddgUrl) {
      const buf = await downloadImage(ddgUrl)
      if (buf) return { buffer: buf, source: 'image-search' }
    }
    await sleep(350)
  }

  return null
}

async function processProfileImage(buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: 800, height: 800, fit: 'cover', position: 'centre' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer()
}

async function uploadArtistImage(artistId, image) {
  const path = `artist/${artistId}/profile.jpg`
  const bucket = 'artist-images'

  const { error } = await supabase.storage.from(bucket).upload(path, image, {
    upsert: true,
    contentType: 'image/jpeg',
    cacheControl: '31536000',
  })
  if (error) throw new Error(`upload: ${error.message}`)

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

async function withRetries(fn, { attempts = 5, delayMs = 3000, label = 'request' } = {}) {
  let lastErr
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (i < attempts) {
        console.warn(`${label} failed (attempt ${i}/${attempts}): ${err.message || err}. Retrying...`)
        await sleep(delayMs)
      }
    }
  }
  throw lastErr
}

async function fetchArtists() {
  let query = supabase
    .from('artists')
    .select('id,name,slug,website,instagram,nationality,city,profile_image_url')
    .order('name')

  if (!force) {
    query = query.is('profile_image_url', null)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

async function main() {
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}${force ? ' (force)' : ''}`)

  const artists = await withRetries(fetchArtists, { label: 'Fetch artists' })

  console.log(`Processing ${artists.length} artists...\n`)

  const results = { ok: 0, skip: 0, fail: 0 }
  const failed = []

  for (let i = 0; i < artists.length; i++) {
    const a = artists[i]
    const prefix = `[${i + 1}/${artists.length}] ${a.name.trim()}`

    if (!force && a.profile_image_url) {
      console.log(`${prefix} — skip (already has image)`)
      results.skip++
      continue
    }

    try {
      const found = await findImage(a)
      if (!found) {
        console.log(`${prefix} — no image found`)
        failed.push(a.name.trim())
        results.fail++
        await sleep(500)
        continue
      }

      const profile = await processProfileImage(found.buffer)

      if (dryRun) {
        console.log(`${prefix} — found via ${found.source} (${profile.length}b)`)
        results.ok++
        await sleep(400)
        continue
      }

      const profileUrl = await uploadArtistImage(a.id, profile)
      const { error: updateErr } = await supabase
        .from('artists')
        .update({ profile_image_url: profileUrl })
        .eq('id', a.id)

      if (updateErr) throw new Error(updateErr.message)

      console.log(`${prefix} — ✓ ${found.source}`)
      results.ok++
    } catch (err) {
      console.log(`${prefix} — error: ${err.message}`)
      failed.push(a.name.trim())
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
