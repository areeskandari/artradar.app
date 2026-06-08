import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

type DatabaseClient = SupabaseClient

let serviceRoleClient: DatabaseClient | null = null

function getServiceRoleClient(): DatabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  if (!serviceRoleClient) {
    serviceRoleClient = createSupabaseClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }

  return serviceRoleClient
}

/** Server client using anon key (respects RLS). Use for auth and user-scoped data. */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookies can be set in middleware
          }
        },
      },
    }
  )
}

/** Service role client (bypasses RLS). Requires SUPABASE_SERVICE_ROLE_KEY. */
export async function createAdminClient(): Promise<DatabaseClient> {
  const client = getServiceRoleClient()
  if (!client) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }
  return client
}

/** Server-side reads of public data. Uses service role when configured (no cookie overhead). */
export async function createPublicDataClient(): Promise<DatabaseClient> {
  const serviceClient = getServiceRoleClient()
  if (serviceClient) return serviceClient
  return createClient()
}
