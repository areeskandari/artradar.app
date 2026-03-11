import { NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

type EntityType = 'gallery' | 'event' | 'artist' | 'news'

const BUCKET_BY_ENTITY: Record<EntityType, string> = {
  gallery: 'gallery-images',
  event: 'event-images',
  artist: 'artist-images',
  news: 'news-images',
}

function safeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-')
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profile.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const form = await request.formData()
  const entityType = form.get('entityType')
  const entityId = form.get('entityId')
  const file = form.get('file')

  if (typeof entityType !== 'string' || typeof entityId !== 'string') {
    return NextResponse.json({ error: 'Missing entityType/entityId' }, { status: 400 })
  }

  if (!['gallery', 'event', 'artist', 'news'].includes(entityType)) {
    return NextResponse.json({ error: 'Invalid entityType' }, { status: 400 })
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }

  const bucket = BUCKET_BY_ENTITY[entityType as EntityType]
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const path = `${entityType}/${entityId}/${Date.now()}-${safeFilename(file.name || `image.${ext}`)}`

  const admin = await createAdminClient()
  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      contentType: file.type || undefined,
      cacheControl: '3600',
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = admin.storage.from(bucket).getPublicUrl(path)

  return NextResponse.json({ publicUrl: data.publicUrl, bucket, path })
}

