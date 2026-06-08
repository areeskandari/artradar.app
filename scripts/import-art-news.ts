#!/usr/bin/env npx tsx
/**
 * Manually run the Dubai art news import (same logic as the daily cron job).
 *
 * Usage: npm run import-news
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run supabase/news-import-schema.sql in Supabase first.
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { importArtNews } from '../src/lib/news/import-art-news'

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

importArtNews()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2))
    process.exit(result.errors.length > 0 && result.imported === 0 ? 1 : 0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
