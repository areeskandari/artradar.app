'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Building2, User, Calendar, Newspaper, Users, Star, Trash2, CheckCircle, Plus, Settings, Handshake, Paperclip } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Label, Select } from '@/components/ui/Input'
import { MultiSelect } from '@/components/ui/MultiSelect'
import { Badge } from '@/components/ui/Badge'
import { EventTypeBadge } from '@/components/ui/EventTypeBadge'
import { CollaborationCategoryBadge } from '@/components/ui/CollaborationCategoryBadge'
import { CollaborationRegionBadges } from '@/components/ui/CollaborationRegionBadges'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { formatDate, slugify, GALLERY_AREAS, GALLERY_TYPES, EVENT_TYPES, COLLABORATION_CATEGORIES, COLLABORATION_REGIONS, formatFileSize, getPlaceholderImage } from '@/lib/utils'
import type { Gallery, Artist, Event, NewsPost, Subscriber, Collaboration, CollaborationAttachment } from '@/types'

type Tab = 'overview' | 'settings' | 'galleries' | 'artists' | 'events' | 'news' | 'collaborations' | 'subscribers'

interface Props {
  galleries: Gallery[]
  artists: Artist[]
  events: Event[]
  news: NewsPost[]
  collaborations: Collaboration[]
  subscribers: Subscriber[]
  galleryArtists: Record<string, string[]>
  eventArtists: Record<string, string[]>
  galleryAreas: { id: string; value: string; label: string; sort_order: number }[]
}

export function SuperAdminClient({ galleries, artists, events, news, collaborations, subscribers, galleryArtists, eventArtists, galleryAreas }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)

  // Inline edit state
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null)
  const [editingArtistId, setEditingArtistId] = useState<string | null>(null)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null)
  const [editingCollaborationId, setEditingCollaborationId] = useState<string | null>(null)

  const [editGalleryForm, setEditGalleryForm] = useState({
    name: '', description: '', address: '', area: '' as string, type: 'gallery' as string,
    website: '', instagram: '', email: '', phone: '', submission_policy: '', founded_year: '',
    lat: '', lng: '',
    is_featured: false, is_for_kids: false, subscription_active: false,
  })

  const [editArtistForm, setEditArtistForm] = useState({
    name: '', nationality: '', city: '', bio: '', website: '', instagram: '',
    open_to_collaboration: false, is_verified: false,
  })

  const [editEventForm, setEditEventForm] = useState({
    title: '', description: '', start_date: '', end_date: '', opening_date: '', location: '',
    lat: '', lng: '',
    gallery_id: '' as string, event_type: 'exhibition' as string, ticket_info: '', vip_access: false, is_featured: false, is_for_kids: false,
  })

  const [editNewsForm, setEditNewsForm] = useState({
    title: '', content: '', publish_date: '', related_gallery_id: '', related_artist_id: '', related_collaboration_id: '',
  })

  const [editCollaborationForm, setEditCollaborationForm] = useState({
    title: '', description: '', category: 'open_call' as string, regions: [] as string[], external_link: '', deadline: '', contact_email: '', contact_whatsapp: '', contact_info: '', is_featured: false,
  })

  // Relation multi-select state (when editing an entity)
  const [editGalleryArtistIds, setEditGalleryArtistIds] = useState<string[]>([])
  const [editGalleryEventIds, setEditGalleryEventIds] = useState<string[]>([])
  const [editGalleryNewsIds, setEditGalleryNewsIds] = useState<string[]>([])
  const [editEventArtistIds, setEditEventArtistIds] = useState<string[]>([])
  const [editArtistGalleryIds, setEditArtistGalleryIds] = useState<string[]>([])
  const [editArtistEventIds, setEditArtistEventIds] = useState<string[]>([])
  const [editArtistNewsIds, setEditArtistNewsIds] = useState<string[]>([])
  const [editCollaborationNewsIds, setEditCollaborationNewsIds] = useState<string[]>([])

  // Gallery areas (Settings): list from props, local state for add/edit
  const [areas, setAreas] = useState<{ id: string; value: string; label: string; sort_order: number }[]>([])
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null)
  const [areaForm, setAreaForm] = useState({ value: '', label: '' })
  const [showAreaForm, setShowAreaForm] = useState(false)

  // Pending users (awaiting admin role)
  const [pendingUsers, setPendingUsers] = useState<{ id: string; email?: string; created_at: string }[]>([])
  const [pendingLoading, setPendingLoading] = useState(false)
  const [assigningId, setAssigningId] = useState<string | null>(null)

  // News form
  const [showNewsForm, setShowNewsForm] = useState(false)
  const [newsForm, setNewsForm] = useState({ title: '', content: '', publish_date: '', related_gallery_id: '', related_artist_id: '', related_collaboration_id: '' })

  const [showCollaborationForm, setShowCollaborationForm] = useState(false)
  const [collaborationForm, setCollaborationForm] = useState({
    title: '', description: '', category: 'open_call' as string, regions: [] as string[], external_link: '', deadline: '', contact_email: '', contact_whatsapp: '', contact_info: '', is_featured: false,
  })
  const [collaborationPosterFile, setCollaborationPosterFile] = useState<File | null>(null)
  const [collaborationPosterPreview, setCollaborationPosterPreview] = useState<string | null>(null)
  const [editCollaborationPosterFile, setEditCollaborationPosterFile] = useState<File | null>(null)
  const [editCollaborationPosterPreview, setEditCollaborationPosterPreview] = useState<string | null>(null)
  const [pendingCollaborationAttachments, setPendingCollaborationAttachments] = useState<File[]>([])

  // Gallery form
  const [showGalleryForm, setShowGalleryForm] = useState(false)
  const [galleryForm, setGalleryForm] = useState({
    name: '', description: '', address: '', area: '' as string, type: 'gallery' as string,
    website: '', instagram: '', email: '', phone: '', submission_policy: '', founded_year: '',
    lat: '', lng: '',
    is_featured: false, is_for_kids: false, subscription_active: false,
  })

  // Artist form
  const [showArtistForm, setShowArtistForm] = useState(false)
  const [artistForm, setArtistForm] = useState({
    name: '', nationality: '', city: '', bio: '', website: '', instagram: '',
    open_to_collaboration: false, is_verified: false,
  })

  // Event form
  const [showEventForm, setShowEventForm] = useState(false)
  const [eventForm, setEventForm] = useState({
    title: '', description: '', start_date: '', end_date: '', opening_date: '', location: '',
    lat: '', lng: '',
    gallery_id: '' as string, event_type: 'exhibition' as string, ticket_info: '', vip_access: false, is_featured: false, is_for_kids: false,
  })

  const supabase = createClient()

  async function uploadImageAndUpdate(opts: {
    entityType: 'gallery' | 'event' | 'artist' | 'news' | 'collaboration'
    entityId: string
    file: File
    table: 'galleries' | 'events' | 'artists' | 'news' | 'collaborations'
    field: 'cover_image_url' | 'image_url' | 'profile_image_url'
  }) {
    const { entityType, entityId, file, table, field } = opts
    const key = `${entityType}:${entityId}`
    setUploadingKey(key)
    setMessage('')

    try {
      const form = new FormData()
      form.append('entityType', entityType)
      form.append('entityId', entityId)
      form.append('file', file)

      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) throw new Error(data?.error || 'Upload failed')

      const publicUrl = data.publicUrl as string | undefined
      if (!publicUrl) throw new Error('Upload succeeded but URL missing')

      const { error } = await supabase.from(table).update({ [field]: publicUrl }).eq('id', entityId)
      if (error) throw new Error(error.message)

      setMessage('Image updated!')
      router.refresh()
    } catch (e) {
      setMessage(`Error: ${e instanceof Error ? e.message : 'Upload failed'}`)
    } finally {
      setUploadingKey(null)
    }
  }

  async function toggleFeaturedGallery(galleryId: string, current: boolean) {
    const { error } = await supabase.from('galleries').update({ is_featured: !current }).eq('id', galleryId)
    if (!error) router.refresh()
  }

  async function toggleFeaturedEvent(eventId: string, current: boolean) {
    const { error } = await supabase.from('events').update({ is_featured: !current }).eq('id', eventId)
    if (!error) router.refresh()
  }

  async function toggleVerifiedArtist(artistId: string, current: boolean) {
    const { error } = await supabase.from('artists').update({ is_verified: !current }).eq('id', artistId)
    if (!error) router.refresh()
  }

  async function deleteNews(id: string) {
    if (!confirm('Delete this news post?')) return
    await supabase.from('news').delete().eq('id', id)
    router.refresh()
  }

  async function updateGallery(id: string) {
    if (!editGalleryForm.name.trim()) {
      setMessage('Name is required')
      return
    }
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('galleries').update({
      name: editGalleryForm.name,
      slug: slugify(editGalleryForm.name),
      description: editGalleryForm.description || null,
      address: editGalleryForm.address || null,
      area: editGalleryForm.area || null,
      type: (editGalleryForm.type as 'gallery' | 'museum' | 'library') || null,
      website: editGalleryForm.website || null,
      instagram: editGalleryForm.instagram || null,
      email: editGalleryForm.email || null,
      phone: editGalleryForm.phone || null,
      submission_policy: editGalleryForm.submission_policy || null,
      founded_year: editGalleryForm.founded_year ? parseInt(editGalleryForm.founded_year, 10) : null,
      lat: editGalleryForm.lat ? parseFloat(editGalleryForm.lat) : null,
      lng: editGalleryForm.lng ? parseFloat(editGalleryForm.lng) : null,
      is_featured: editGalleryForm.is_featured,
      is_for_kids: editGalleryForm.is_for_kids,
      subscription_active: editGalleryForm.subscription_active,
    }).eq('id', id)
    if (error) {
      setSaving(false)
      setMessage(`Error: ${error.message}`)
      return
    }
    await supabase.from('gallery_artists').delete().eq('gallery_id', id)
    if (editGalleryArtistIds.length > 0) {
      await supabase.from('gallery_artists').insert(editGalleryArtistIds.map((artist_id) => ({ gallery_id: id, artist_id })))
    }
    const previouslyLinkedEventIds = events.filter((e) => e.gallery_id === id).map((e) => e.id)
    for (const eventId of previouslyLinkedEventIds) {
      if (!editGalleryEventIds.includes(eventId)) {
        await supabase.from('events').update({ gallery_id: null }).eq('id', eventId)
      }
    }
    for (const eventId of editGalleryEventIds) {
      await supabase.from('events').update({ gallery_id: id }).eq('id', eventId)
    }
    const previouslyLinkedNewsIds = news.filter((n) => n.related_gallery_id === id).map((n) => n.id)
    for (const newsId of previouslyLinkedNewsIds) {
      if (!editGalleryNewsIds.includes(newsId)) {
        await supabase.from('news').update({ related_gallery_id: null }).eq('id', newsId)
      }
    }
    for (const newsId of editGalleryNewsIds) {
      await supabase.from('news').update({ related_gallery_id: id }).eq('id', newsId)
    }
    setSaving(false)
    setMessage('Gallery updated!')
    setEditingGalleryId(null)
    router.refresh()
  }

  async function updateArtist(id: string) {
    if (!editArtistForm.name.trim()) {
      setMessage('Name is required')
      return
    }
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('artists').update({
      name: editArtistForm.name,
      slug: slugify(editArtistForm.name),
      nationality: editArtistForm.nationality || null,
      city: editArtistForm.city || null,
      bio: editArtistForm.bio || null,
      website: editArtistForm.website || null,
      instagram: editArtistForm.instagram || null,
      open_to_collaboration: editArtistForm.open_to_collaboration,
      is_verified: editArtistForm.is_verified,
    }).eq('id', id)
    if (error) {
      setSaving(false)
      setMessage(`Error: ${error.message}`)
      return
    }
    await supabase.from('gallery_artists').delete().eq('artist_id', id)
    if (editArtistGalleryIds.length > 0) {
      await supabase.from('gallery_artists').insert(editArtistGalleryIds.map((gallery_id) => ({ gallery_id, artist_id: id })))
    }
    await supabase.from('event_artists').delete().eq('artist_id', id)
    if (editArtistEventIds.length > 0) {
      await supabase.from('event_artists').insert(editArtistEventIds.map((event_id) => ({ event_id, artist_id: id })))
    }
    const previouslyLinkedNewsIds = news.filter((n) => n.related_artist_id === id).map((n) => n.id)
    for (const newsId of previouslyLinkedNewsIds) {
      if (!editArtistNewsIds.includes(newsId)) {
        await supabase.from('news').update({ related_artist_id: null }).eq('id', newsId)
      }
    }
    for (const newsId of editArtistNewsIds) {
      await supabase.from('news').update({ related_artist_id: id }).eq('id', newsId)
    }
    setSaving(false)
    setMessage('Artist updated!')
    setEditingArtistId(null)
    router.refresh()
  }

  async function updateEvent(id: string) {
    if (!editEventForm.title.trim()) {
      setMessage('Title is required')
      return
    }
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('events').update({
      title: editEventForm.title,
      slug: slugify(editEventForm.title),
      description: editEventForm.description || null,
      start_date: editEventForm.start_date || null,
      end_date: editEventForm.end_date || null,
      opening_date: editEventForm.opening_date || null,
      location: editEventForm.location || null,
      lat: editEventForm.lat ? parseFloat(editEventForm.lat) : null,
      lng: editEventForm.lng ? parseFloat(editEventForm.lng) : null,
      gallery_id: editEventForm.gallery_id || null,
      event_type: (editEventForm.event_type as 'exhibition' | 'talk' | 'art_fair' | 'workshop' | 'opening' | 'performance') || null,
      ticket_info: editEventForm.ticket_info || null,
      vip_access: editEventForm.vip_access,
      is_featured: editEventForm.is_featured,
      is_for_kids: editEventForm.is_for_kids,
    }).eq('id', id)
    if (error) {
      setSaving(false)
      setMessage(`Error: ${error.message}`)
      return
    }
    await supabase.from('event_artists').delete().eq('event_id', id)
    if (editEventArtistIds.length > 0) {
      await supabase.from('event_artists').insert(editEventArtistIds.map((artist_id) => ({ event_id: id, artist_id })))
    }
    setSaving(false)
    setMessage('Event updated!')
    setEditingEventId(null)
    router.refresh()
  }

  async function updateNews(id: string) {
    if (!editNewsForm.title.trim()) {
      setMessage('Title is required')
      return
    }
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('news').update({
      title: editNewsForm.title,
      slug: slugify(editNewsForm.title),
      content: editNewsForm.content || null,
      publish_date: editNewsForm.publish_date || new Date().toISOString(),
      related_gallery_id: editNewsForm.related_gallery_id || null,
      related_artist_id: editNewsForm.related_artist_id || null,
      related_collaboration_id: editNewsForm.related_collaboration_id || null,
    }).eq('id', id)
    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'News updated!')
    if (!error) {
      setEditingNewsId(null)
      router.refresh()
    }
  }

  async function saveNews() {
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('news').insert({
      ...newsForm,
      slug: slugify(newsForm.title),
      publish_date: newsForm.publish_date || new Date().toISOString(),
      related_gallery_id: newsForm.related_gallery_id || null,
      related_artist_id: newsForm.related_artist_id || null,
      related_collaboration_id: newsForm.related_collaboration_id || null,
    })
    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'News post created!')
    if (!error) {
      setShowNewsForm(false)
      setNewsForm({ title: '', content: '', publish_date: '', related_gallery_id: '', related_artist_id: '', related_collaboration_id: '' })
      router.refresh()
    }
  }

  async function saveGallery() {
    if (!galleryForm.name.trim()) {
      setMessage('Name is required')
      return
    }
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('galleries').insert({
      name: galleryForm.name,
      slug: slugify(galleryForm.name),
      description: galleryForm.description || null,
      address: galleryForm.address || null,
      area: galleryForm.area || null,
      type: (galleryForm.type as 'gallery' | 'museum' | 'library') || null,
      website: galleryForm.website || null,
      instagram: galleryForm.instagram || null,
      email: galleryForm.email || null,
      phone: galleryForm.phone || null,
      submission_policy: galleryForm.submission_policy || null,
      founded_year: galleryForm.founded_year ? parseInt(galleryForm.founded_year, 10) : null,
      lat: galleryForm.lat ? parseFloat(galleryForm.lat) : null,
      lng: galleryForm.lng ? parseFloat(galleryForm.lng) : null,
      is_featured: galleryForm.is_featured,
      is_for_kids: galleryForm.is_for_kids,
      subscription_active: galleryForm.subscription_active,
    })
    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'Gallery created!')
    if (!error) {
      setShowGalleryForm(false)
      setGalleryForm({ name: '', description: '', address: '', area: '', type: 'gallery', website: '', instagram: '', email: '', phone: '', submission_policy: '', founded_year: '', lat: '', lng: '', is_featured: false, is_for_kids: false, subscription_active: false })
      router.refresh()
    }
  }

  async function deleteGallery(id: string) {
    if (!confirm('Delete this gallery? This may affect linked events.')) return
    await supabase.from('galleries').delete().eq('id', id)
    router.refresh()
  }

  async function saveArtist() {
    if (!artistForm.name.trim()) {
      setMessage('Name is required')
      return
    }
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('artists').insert({
      name: artistForm.name,
      slug: slugify(artistForm.name),
      nationality: artistForm.nationality || null,
      city: artistForm.city || null,
      bio: artistForm.bio || null,
      website: artistForm.website || null,
      instagram: artistForm.instagram || null,
      open_to_collaboration: artistForm.open_to_collaboration,
      is_verified: artistForm.is_verified,
    })
    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'Artist created!')
    if (!error) {
      setShowArtistForm(false)
      setArtistForm({ name: '', nationality: '', city: '', bio: '', website: '', instagram: '', open_to_collaboration: false, is_verified: false })
      router.refresh()
    }
  }

  async function deleteArtist(id: string) {
    if (!confirm('Delete this artist?')) return
    await supabase.from('artists').delete().eq('id', id)
    router.refresh()
  }

  async function saveEvent() {
    if (!eventForm.title.trim()) {
      setMessage('Title is required')
      return
    }
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('events').insert({
      title: eventForm.title,
      slug: slugify(eventForm.title),
      description: eventForm.description || null,
      start_date: eventForm.start_date || null,
      end_date: eventForm.end_date || null,
      opening_date: eventForm.opening_date || null,
      location: eventForm.location || null,
      lat: eventForm.lat ? parseFloat(eventForm.lat) : null,
      lng: eventForm.lng ? parseFloat(eventForm.lng) : null,
      gallery_id: eventForm.gallery_id || null,
      event_type: (eventForm.event_type as 'exhibition' | 'talk' | 'art_fair' | 'workshop' | 'opening' | 'performance') || null,
      ticket_info: eventForm.ticket_info || null,
      vip_access: eventForm.vip_access,
      is_featured: eventForm.is_featured,
      is_for_kids: eventForm.is_for_kids,
    })
    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'Event created!')
    if (!error) {
      setShowEventForm(false)
      setEventForm({ title: '', description: '', start_date: '', end_date: '', opening_date: '', location: '', lat: '', lng: '', gallery_id: '', event_type: 'exhibition', ticket_info: '', vip_access: false, is_featured: false, is_for_kids: false })
      router.refresh()
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    router.refresh()
  }

  async function uploadCollaborationFile(entityId: string, file: File): Promise<string> {
    const form = new FormData()
    form.append('entityType', 'collaboration')
    form.append('entityId', entityId)
    form.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Upload failed')
    const publicUrl = data.publicUrl as string | undefined
    if (!publicUrl) throw new Error('Upload succeeded but URL missing')
    return publicUrl
  }

  async function uploadCollaborationAttachmentFile(entityId: string, file: File): Promise<CollaborationAttachment> {
    const form = new FormData()
    form.append('entityType', 'collaboration-attachment')
    form.append('entityId', entityId)
    form.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Upload failed')
    const publicUrl = data.publicUrl as string | undefined
    if (!publicUrl) throw new Error('Upload succeeded but URL missing')
    return {
      name: (data.fileName as string) || file.name,
      url: publicUrl,
      mime_type: (data.mimeType as string) || file.type || null,
      size: (data.size as number) || file.size,
    }
  }

  function clearCollaborationPosterDraft() {
    if (collaborationPosterPreview) URL.revokeObjectURL(collaborationPosterPreview)
    setCollaborationPosterFile(null)
    setCollaborationPosterPreview(null)
  }

  function clearEditCollaborationPosterDraft() {
    if (editCollaborationPosterPreview) URL.revokeObjectURL(editCollaborationPosterPreview)
    setEditCollaborationPosterFile(null)
    setEditCollaborationPosterPreview(null)
  }

  function handleCollaborationPosterSelect(file: File | undefined, mode: 'create' | 'edit') {
    if (!file) return
    if (mode === 'create') {
      if (collaborationPosterPreview) URL.revokeObjectURL(collaborationPosterPreview)
      setCollaborationPosterFile(file)
      setCollaborationPosterPreview(URL.createObjectURL(file))
      return
    }
    if (editCollaborationPosterPreview) URL.revokeObjectURL(editCollaborationPosterPreview)
    setEditCollaborationPosterFile(file)
    setEditCollaborationPosterPreview(URL.createObjectURL(file))
  }

  async function uploadCollaborationPhoto(collaborationId: string, file: File) {
    const key = `collaboration-photo:${collaborationId}`
    setUploadingKey(key)
    setMessage('')
    try {
      const publicUrl = await uploadCollaborationFile(collaborationId, file)
      const item = collaborations.find((c) => c.id === collaborationId)
      const photos = [...(item?.photos || []), publicUrl]
      const { error } = await supabase.from('collaborations').update({ photos }).eq('id', collaborationId)
      if (error) throw new Error(error.message)
      setMessage('Photo added!')
      router.refresh()
    } catch (e) {
      setMessage(`Error: ${e instanceof Error ? e.message : 'Upload failed'}`)
    } finally {
      setUploadingKey(null)
    }
  }

  async function uploadCollaborationPoster(collaborationId: string, file: File) {
    const key = `collaboration:${collaborationId}`
    setUploadingKey(key)
    setMessage('')
    try {
      const publicUrl = await uploadCollaborationFile(collaborationId, file)
      const { error } = await supabase.from('collaborations').update({ cover_image_url: publicUrl }).eq('id', collaborationId)
      if (error) throw new Error(error.message)
      setMessage('Poster updated!')
      router.refresh()
    } catch (e) {
      setMessage(`Error: ${e instanceof Error ? e.message : 'Upload failed'}`)
    } finally {
      setUploadingKey(null)
    }
  }

  async function removeCollaborationPhoto(collaborationId: string, photoUrl: string) {
    const item = collaborations.find((c) => c.id === collaborationId)
    if (!item) return
    const photos = item.photos.filter((p) => p !== photoUrl)
    const { error } = await supabase.from('collaborations').update({ photos }).eq('id', collaborationId)
    if (!error) router.refresh()
  }

  async function uploadCollaborationAttachment(collaborationId: string, file: File) {
    const key = `collaboration-attachment:${collaborationId}`
    setUploadingKey(key)
    setMessage('')
    try {
      const attachment = await uploadCollaborationAttachmentFile(collaborationId, file)
      const item = collaborations.find((c) => c.id === collaborationId)
      const attachments = [...(item?.attachments || []), attachment]
      const { error } = await supabase.from('collaborations').update({ attachments }).eq('id', collaborationId)
      if (error) throw new Error(error.message)
      setMessage('Attachment added!')
      router.refresh()
    } catch (e) {
      setMessage(`Error: ${e instanceof Error ? e.message : 'Upload failed'}`)
    } finally {
      setUploadingKey(null)
    }
  }

  async function removeCollaborationAttachment(collaborationId: string, attachmentUrl: string) {
    const item = collaborations.find((c) => c.id === collaborationId)
    if (!item) return
    const attachments = item.attachments.filter((a) => a.url !== attachmentUrl)
    const { error } = await supabase.from('collaborations').update({ attachments }).eq('id', collaborationId)
    if (!error) router.refresh()
  }

  async function appendCollaborationAttachments(
    collaborationId: string,
    files: File[],
    existing: CollaborationAttachment[] = []
  ) {
    if (files.length === 0) return
    const uploaded: CollaborationAttachment[] = []
    for (const file of files) {
      uploaded.push(await uploadCollaborationAttachmentFile(collaborationId, file))
    }
    const attachments = [...existing, ...uploaded]
    const { error } = await supabase.from('collaborations').update({ attachments }).eq('id', collaborationId)
    if (error) throw new Error(error.message)
  }

  async function saveCollaboration() {
    if (!collaborationForm.title.trim()) {
      setMessage('Title is required')
      return
    }
    setSaving(true)
    setMessage('')
    const { data: created, error } = await supabase.from('collaborations').insert({
      title: collaborationForm.title,
      slug: slugify(collaborationForm.title),
      description: collaborationForm.description || null,
      category: collaborationForm.category,
      regions: collaborationForm.regions,
      external_link: collaborationForm.external_link || null,
      deadline: collaborationForm.deadline || null,
      contact_email: collaborationForm.contact_email.trim() || null,
      contact_whatsapp: collaborationForm.contact_whatsapp.trim() || null,
      contact_info: collaborationForm.contact_info || null,
      is_featured: collaborationForm.is_featured,
      photos: [],
      attachments: [],
    }).select('id').single()

    if (!error && created) {
      try {
        if (collaborationPosterFile) {
          const publicUrl = await uploadCollaborationFile(created.id, collaborationPosterFile)
          const { error: posterError } = await supabase
            .from('collaborations')
            .update({ cover_image_url: publicUrl })
            .eq('id', created.id)
          if (posterError) throw new Error(posterError.message)
        }
        if (pendingCollaborationAttachments.length > 0) {
          await appendCollaborationAttachments(created.id, pendingCollaborationAttachments)
        }
      } catch (e) {
        setSaving(false)
        setMessage(`Error: Listing created but file upload failed — ${e instanceof Error ? e.message : 'Upload failed'}`)
        router.refresh()
        return
      }
    }

    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'Collaboration created!')
    if (!error) {
      setShowCollaborationForm(false)
      setCollaborationForm({ title: '', description: '', category: 'open_call', regions: [], external_link: '', deadline: '', contact_email: '', contact_whatsapp: '', contact_info: '', is_featured: false })
      clearCollaborationPosterDraft()
      setPendingCollaborationAttachments([])
      router.refresh()
    }
  }

  async function updateCollaboration(id: string) {
    setSaving(true)
    setMessage('')
    try {
      let coverImageUrl: string | undefined
      if (editCollaborationPosterFile) {
        coverImageUrl = await uploadCollaborationFile(id, editCollaborationPosterFile)
      }

      const { error } = await supabase.from('collaborations').update({
        title: editCollaborationForm.title,
        slug: slugify(editCollaborationForm.title),
        description: editCollaborationForm.description || null,
        category: editCollaborationForm.category,
        regions: editCollaborationForm.regions,
        external_link: editCollaborationForm.external_link || null,
        deadline: editCollaborationForm.deadline || null,
        contact_email: editCollaborationForm.contact_email.trim() || null,
        contact_whatsapp: editCollaborationForm.contact_whatsapp.trim() || null,
        contact_info: editCollaborationForm.contact_info || null,
        is_featured: editCollaborationForm.is_featured,
        ...(coverImageUrl ? { cover_image_url: coverImageUrl } : {}),
      }).eq('id', id)

      if (error) {
        setSaving(false)
        setMessage(`Error: ${error.message}`)
        return
      }

      const previouslyLinkedNewsIds = news.filter((n) => n.related_collaboration_id === id).map((n) => n.id)
      for (const newsId of previouslyLinkedNewsIds) {
        if (!editCollaborationNewsIds.includes(newsId)) {
          await supabase.from('news').update({ related_collaboration_id: null }).eq('id', newsId)
        }
      }
      for (const newsId of editCollaborationNewsIds) {
        await supabase.from('news').update({ related_collaboration_id: id }).eq('id', newsId)
      }

      setSaving(false)
      setMessage('Collaboration updated!')
      setEditingCollaborationId(null)
      clearEditCollaborationPosterDraft()
      router.refresh()
    } catch (e) {
      setSaving(false)
      setMessage(`Error: ${e instanceof Error ? e.message : 'Upload failed'}`)
    }
  }

  async function deleteCollaboration(id: string) {
    if (!confirm('Delete this collaboration listing?')) return
    await supabase.from('collaborations').delete().eq('id', id)
    router.refresh()
  }

  async function toggleFeaturedCollaboration(id: string, current: boolean) {
    const { error } = await supabase.from('collaborations').update({ is_featured: !current }).eq('id', id)
    if (!error) router.refresh()
  }

  async function loadPendingUsers() {
    setPendingLoading(true)
    try {
      const res = await fetch('/api/admin/pending-users')
      const data = await res.json()
      if (res.ok) setPendingUsers(data.pending || [])
      else setMessage(data.error || 'Failed to load pending users')
    } finally {
      setPendingLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'settings') loadPendingUsers()
  }, [tab])

  useEffect(() => {
    setAreas(galleryAreas)
  }, [galleryAreas])

  async function saveGalleryArea() {
    const value = areaForm.value.trim()
    const label = areaForm.label.trim()
    if (!value || !label) {
      setMessage('Value and label are required')
      return
    }
    setSaving(true)
    setMessage('')
    if (editingAreaId) {
      const { error } = await supabase.from('gallery_areas').update({ value, label }).eq('id', editingAreaId)
      setSaving(false)
      setMessage(error ? `Error: ${error.message}` : 'Area updated!')
      if (!error) {
        setEditingAreaId(null)
        setAreaForm({ value: '', label: '' })
        router.refresh()
      }
    } else {
      const maxOrder = areas.length ? Math.max(...areas.map((a) => a.sort_order), 0) : 0
      const { error } = await supabase.from('gallery_areas').insert({ value, label, sort_order: maxOrder + 1 })
      setSaving(false)
      setMessage(error ? `Error: ${error.message}` : 'Area added!')
      if (!error) {
        setShowAreaForm(false)
        setAreaForm({ value: '', label: '' })
        router.refresh()
      }
    }
  }

  async function deleteGalleryArea(id: string, value: string) {
    if (!confirm(`Remove area "${value}"? Galleries using it will have their area cleared.`)) return
    setSaving(true)
    await supabase.from('galleries').update({ area: null }).eq('area', value)
    await supabase.from('gallery_areas').delete().eq('id', id)
    setSaving(false)
    setMessage('Area removed.')
    setEditingAreaId(null)
    router.refresh()
  }

  async function assignRole(userId: string, role: 'super_admin' | 'gallery_admin' | 'artist', galleryId?: string, artistId?: string) {
    setAssigningId(userId)
    setMessage('')
    try {
      const res = await fetch('/api/admin/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role, galleryId: galleryId || undefined, artistId: artistId || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Role assigned. User can refresh their dashboard.')
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId))
        router.refresh()
      } else {
        setMessage(data.error || 'Failed to assign role')
      }
    } finally {
      setAssigningId(null)
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Shield size={14} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={14} />, count: pendingUsers.length > 0 ? pendingUsers.length : undefined },
    { id: 'galleries', label: 'Galleries', icon: <Building2 size={14} />, count: galleries.length },
    { id: 'artists', label: 'Artists', icon: <User size={14} />, count: artists.length },
    { id: 'events', label: 'Events', icon: <Calendar size={14} />, count: events.length },
    { id: 'news', label: 'News', icon: <Newspaper size={14} />, count: news.length },
    { id: 'collaborations', label: 'Collaboration', icon: <Handshake size={14} />, count: collaborations.length },
    { id: 'subscribers', label: 'Subscribers', icon: <Users size={14} />, count: subscribers.length },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={20} className="text-gold-500" />
          <h1 className="font-serif text-3xl text-ink-900">Super Admin</h1>
        </div>
        <p className="text-ink-500 text-sm">Full control over all Art Radar content</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-ink-200 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id ? 'border-gold-500 text-gold-700' : 'border-transparent text-ink-500 hover:text-ink-900'
            }`}
          >
            {t.icon} {t.label}
            {t.count !== undefined && (
              <span className="text-xs bg-ink-100 text-ink-600 px-1.5 py-0.5 rounded-full">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {message && (
        <div className={`mb-4 px-4 py-2 rounded text-sm ${message.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message}
        </div>
      )}

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Galleries', count: galleries.length, sub: `${galleries.filter(g => g.subscription_active).length} partner`, icon: Building2 },
            { label: 'Artists', count: artists.length, sub: `${artists.filter(a => a.is_verified).length} verified`, icon: User },
            { label: 'Events', count: events.length, sub: `${events.filter(e => e.is_featured).length} featured`, icon: Calendar },
            { label: 'News Posts', count: news.length, sub: 'published', icon: Newspaper },
            { label: 'Collaborations', count: collaborations.length, sub: `${collaborations.filter(c => c.category === 'open_call').length} open calls`, icon: Handshake },
            { label: 'Subscribers', count: subscribers.length, sub: 'total', icon: Users },
            { label: 'Featured Galleries', count: galleries.filter(g => g.is_featured).length, sub: 'on homepage', icon: Star },
          ].map(({ label, count, sub, icon: Icon }) => (
            <div key={label} className="bg-card border border-ink-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-ink-500 mb-2">
                <Icon size={15} />
                <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
              </div>
              <p className="font-serif text-3xl text-ink-900">{count}</p>
              <p className="text-xs text-ink-500 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* SETTINGS */}
      {tab === 'settings' && (
        <div className="space-y-10">
          {/* Pending requests */}
          <div>
            <h2 className="font-serif text-xl text-ink-900 mb-2">Pending requests</h2>
          <p className="text-sm text-ink-500 mb-4">
            These users have signed in but don’t have an admin role yet. Assign a role to grant access.
          </p>
          {pendingLoading ? (
            <p className="text-ink-500">Loading…</p>
          ) : pendingUsers.length === 0 ? (
            <p className="text-ink-500">No pending users.</p>
          ) : (
            <div className="bg-card border border-ink-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-200 bg-ink-50">
                    <th className="text-left py-3 px-4 font-medium text-ink-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-ink-700">Signed up</th>
                    <th className="text-right py-3 px-4 font-medium text-ink-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((u) => (
                    <tr key={u.id} className="border-b border-ink-100 hover:bg-ink-50/50">
                      <td className="py-3 px-4 text-ink-900">{u.email || u.id}</td>
                      <td className="py-3 px-4 text-ink-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={assigningId === u.id}
                          onClick={() => assignRole(u.id, 'super_admin')}
                        >
                          {assigningId === u.id ? 'Assigning…' : 'Grant super admin'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
            <p className="text-xs text-ink-400 mt-4">
              For artist or gallery admin roles, add the profile in Supabase (admin_profiles) and link gallery_id or artist_id.
            </p>
          </div>

          {/* Gallery areas */}
          <div>
            <h2 className="font-serif text-xl text-ink-900 mb-2">Gallery areas</h2>
            <p className="text-sm text-ink-500 mb-4">
              Areas used when creating or editing galleries (e.g. DIFC, Alserkal Avenue). Add, edit, or remove.
            </p>
            {showAreaForm && (
              <div className="bg-card border border-ink-200 rounded-lg p-4 mb-4 space-y-3 max-w-md">
                <h3 className="font-medium text-ink-900">{editingAreaId ? 'Edit area' : 'Add area'}</h3>
                <div>
                  <Label>Value (slug, used in URLs)</Label>
                  <Input
                    value={areaForm.value}
                    onChange={(e) => setAreaForm((f) => ({ ...f, value: e.target.value }))}
                    placeholder="e.g. alserkal-avenue"
                    disabled={!!editingAreaId}
                  />
                </div>
                <div>
                  <Label>Label (display name)</Label>
                  <Input
                    value={areaForm.label}
                    onChange={(e) => setAreaForm((f) => ({ ...f, label: e.target.value }))}
                    placeholder="e.g. Alserkal Avenue"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveGalleryArea} disabled={saving} variant="primary" size="sm">
                    {saving ? 'Saving…' : editingAreaId ? 'Update' : 'Add'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAreaForm(false)
                      setEditingAreaId(null)
                      setAreaForm({ value: '', label: '' })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            {!showAreaForm && (
              <Button onClick={() => setShowAreaForm(true)} variant="gold" size="sm" className="mb-4">
                <Plus size={14} /> Add area
              </Button>
            )}
            <div className="bg-card border border-ink-200 rounded-lg overflow-hidden">
              {areas.length === 0 ? (
                <p className="p-4 text-ink-500 text-sm">No areas yet. Add one above or run the gallery-areas migration.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-200 bg-ink-50">
                      <th className="text-left py-3 px-4 font-medium text-ink-700">Value</th>
                      <th className="text-left py-3 px-4 font-medium text-ink-700">Label</th>
                      <th className="text-right py-3 px-4 font-medium text-ink-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {areas.map((a) => (
                      <tr key={a.id} className="border-b border-ink-100 hover:bg-ink-50/50">
                        <td className="py-3 px-4 text-ink-900 font-mono text-xs">{a.value}</td>
                        <td className="py-3 px-4 text-ink-900">{a.label}</td>
                        <td className="py-3 px-4 text-right flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingAreaId(a.id)
                              setAreaForm({ value: a.value, label: a.label })
                              setShowAreaForm(true)
                            }}
                          >
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteGalleryArea(a.id, a.value)} disabled={saving}>
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GALLERIES */}
      {tab === 'galleries' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-xl text-ink-900">Galleries</h2>
            <Button onClick={() => setShowGalleryForm(!showGalleryForm)} variant="gold" size="sm">
              <Plus size={14} /> New Gallery
            </Button>
          </div>

          {showGalleryForm && (
            <div className="bg-card border border-ink-200 rounded-lg p-5 mb-5 space-y-4">
              <h3 className="font-medium text-ink-900">Add Gallery</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Name *</Label>
                  <Input value={galleryForm.name} onChange={(e) => setGalleryForm({ ...galleryForm, name: e.target.value })} placeholder="Gallery name" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <RichTextEditor
                    value={galleryForm.description}
                    onChange={(html) => setGalleryForm({ ...galleryForm, description: html })}
                    placeholder="Gallery description…"
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={galleryForm.address} onChange={(e) => setGalleryForm({ ...galleryForm, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Latitude (map)</Label>
                    <Input type="number" step="any" placeholder="e.g. 25.2048" value={galleryForm.lat} onChange={(e) => setGalleryForm({ ...galleryForm, lat: e.target.value })} />
                  </div>
                  <div>
                    <Label>Longitude (map)</Label>
                    <Input type="number" step="any" placeholder="e.g. 55.2708" value={galleryForm.lng} onChange={(e) => setGalleryForm({ ...galleryForm, lng: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Area</Label>
                  <Select value={galleryForm.area} onChange={(e) => setGalleryForm({ ...galleryForm, area: e.target.value })}>
                    <option value="">—</option>
                    {galleryAreas.length > 0
                      ? galleryAreas.map((a) => <option key={a.id} value={a.value}>{a.label}</option>)
                      : GALLERY_AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={galleryForm.type} onChange={(e) => setGalleryForm({ ...galleryForm, type: e.target.value })}>
                    {GALLERY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Founded year</Label>
                  <Input type="number" value={galleryForm.founded_year} onChange={(e) => setGalleryForm({ ...galleryForm, founded_year: e.target.value })} placeholder="e.g. 2010" />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input type="url" value={galleryForm.website} onChange={(e) => setGalleryForm({ ...galleryForm, website: e.target.value })} />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <Input value={galleryForm.instagram} onChange={(e) => setGalleryForm({ ...galleryForm, instagram: e.target.value })} placeholder="@handle" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={galleryForm.email} onChange={(e) => setGalleryForm({ ...galleryForm, email: e.target.value })} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={galleryForm.phone} onChange={(e) => setGalleryForm({ ...galleryForm, phone: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Submission policy</Label>
                  <Textarea rows={2} value={galleryForm.submission_policy} onChange={(e) => setGalleryForm({ ...galleryForm, submission_policy: e.target.value })} />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={galleryForm.is_featured} onChange={(e) => setGalleryForm({ ...galleryForm, is_featured: e.target.checked })} className="rounded border-ink-300" />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={galleryForm.is_for_kids} onChange={(e) => setGalleryForm({ ...galleryForm, is_for_kids: e.target.checked })} className="rounded border-ink-300" />
                    For kids
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={galleryForm.subscription_active} onChange={(e) => setGalleryForm({ ...galleryForm, subscription_active: e.target.checked })} className="rounded border-ink-300" />
                    Partner (subscription active)
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveGallery} disabled={saving} variant="primary" size="sm">{saving ? 'Saving...' : 'Create Gallery'}</Button>
                <Button onClick={() => setShowGalleryForm(false)} variant="ghost" size="sm">Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {galleries.map((gallery) => (
              <div key={gallery.id} className="bg-card border border-ink-200 rounded-lg">
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <button
                      onClick={() => {
                        if (editingGalleryId === gallery.id) {
                          setEditingGalleryId(null)
                          return
                        }
                        setEditingGalleryId(gallery.id)
                        setEditGalleryForm({
                          name: gallery.name || '',
                          description: gallery.description || '',
                          address: gallery.address || '',
                          area: (gallery.area || '') as string,
                          type: (gallery.type || 'gallery') as string,
                          website: gallery.website || '',
                          instagram: gallery.instagram || '',
                          email: gallery.email || '',
                          phone: gallery.phone || '',
                          submission_policy: gallery.submission_policy || '',
                          founded_year: gallery.founded_year ? String(gallery.founded_year) : '',
                          lat: gallery.lat != null ? String(gallery.lat) : '',
                          lng: gallery.lng != null ? String(gallery.lng) : '',
                          is_featured: !!gallery.is_featured,
                          is_for_kids: !!gallery.is_for_kids,
                          subscription_active: !!gallery.subscription_active,
                        })
                        setEditGalleryArtistIds(galleryArtists[gallery.id] || [])
                        setEditGalleryEventIds(events.filter((e) => e.gallery_id === gallery.id).map((e) => e.id))
                        setEditGalleryNewsIds(news.filter((n) => n.related_gallery_id === gallery.id).map((n) => n.id))
                      }}
                      className="text-left text-sm font-medium text-ink-900 hover:underline"
                      title="Edit gallery"
                      type="button"
                    >
                      {gallery.name}
                    </button>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-ink-500">{gallery.area} · {gallery.type}</span>
                    {gallery.subscription_active && <Badge variant="verified" className="text-[10px]">Partner</Badge>}
                  </div>
                  </div>
                  <div className="flex items-center gap-2">
                  <label className="text-xs px-2 py-1 rounded border border-ink-200 bg-ink-50 text-ink-600 hover:border-ink-300 cursor-pointer">
                    {uploadingKey === `gallery:${gallery.id}` ? 'Uploading…' : 'Upload image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingKey !== null}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        void uploadImageAndUpdate({
                          entityType: 'gallery',
                          entityId: gallery.id,
                          file: f,
                          table: 'galleries',
                          field: 'cover_image_url',
                        })
                        e.currentTarget.value = ''
                      }}
                    />
                  </label>
                  <button
                    onClick={() => toggleFeaturedGallery(gallery.id, gallery.is_featured)}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${gallery.is_featured ? 'bg-gold-100 text-gold-700 border-gold-300' : 'bg-ink-50 text-ink-500 border-ink-200 hover:border-gold-300'}`}
                  >
                    {gallery.is_featured ? '★ Featured' : '☆ Feature'}
                  </button>
                  <button onClick={() => deleteGallery(gallery.id)} className="p-1.5 text-ink-400 hover:text-red-600 transition-colors" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
                </div>

                {editingGalleryId === gallery.id && (
                  <div className="border-t border-ink-200 px-4 py-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Label>Name *</Label>
                        <Input value={editGalleryForm.name} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, name: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Description</Label>
                        <RichTextEditor
                          value={editGalleryForm.description}
                          onChange={(html) => setEditGalleryForm({ ...editGalleryForm, description: html })}
                          placeholder="Gallery description…"
                        />
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Input value={editGalleryForm.address} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, address: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Latitude (map)</Label>
                          <Input type="number" step="any" placeholder="e.g. 25.2048" value={editGalleryForm.lat} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, lat: e.target.value })} />
                        </div>
                        <div>
                          <Label>Longitude (map)</Label>
                          <Input type="number" step="any" placeholder="e.g. 55.2708" value={editGalleryForm.lng} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, lng: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <Label>Area</Label>
                        <Select value={editGalleryForm.area} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, area: e.target.value })}>
                          <option value="">—</option>
                          {galleryAreas.length > 0
                            ? galleryAreas.map((a) => <option key={a.id} value={a.value}>{a.label}</option>)
                            : GALLERY_AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </Select>
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select value={editGalleryForm.type} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, type: e.target.value })}>
                          {GALLERY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </Select>
                      </div>
                      <div>
                        <Label>Founded year</Label>
                        <Input type="number" value={editGalleryForm.founded_year} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, founded_year: e.target.value })} />
                      </div>
                      <div>
                        <Label>Website</Label>
                        <Input type="url" value={editGalleryForm.website} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, website: e.target.value })} />
                      </div>
                      <div>
                        <Label>Instagram</Label>
                        <Input value={editGalleryForm.instagram} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, instagram: e.target.value })} />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input type="email" value={editGalleryForm.email} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, email: e.target.value })} />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input value={editGalleryForm.phone} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, phone: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Submission policy</Label>
                        <Textarea rows={2} value={editGalleryForm.submission_policy} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, submission_policy: e.target.value })} />
                      </div>
                      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editGalleryForm.is_featured} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, is_featured: e.target.checked })} className="rounded border-ink-300" />
                          Featured
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editGalleryForm.is_for_kids} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, is_for_kids: e.target.checked })} className="rounded border-ink-300" />
                          For kids
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editGalleryForm.subscription_active} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, subscription_active: e.target.checked })} className="rounded border-ink-300" />
                          Partner (subscription active)
                        </label>
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Artists</Label>
                        <MultiSelect
                          options={artists.map((a) => ({ id: a.id, label: a.name }))}
                          value={editGalleryArtistIds}
                          onChange={setEditGalleryArtistIds}
                          placeholder="Select artists…"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Events (at this gallery)</Label>
                        <MultiSelect
                          options={events.map((e) => ({ id: e.id, label: e.title }))}
                          value={editGalleryEventIds}
                          onChange={setEditGalleryEventIds}
                          placeholder="Select events…"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>News (related to this gallery)</Label>
                        <MultiSelect
                          options={news.map((n) => ({ id: n.id, label: n.title }))}
                          value={editGalleryNewsIds}
                          onChange={setEditGalleryNewsIds}
                          placeholder="Select news…"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => updateGallery(gallery.id)} disabled={saving} variant="primary" size="sm">
                        {saving ? 'Saving...' : 'Save changes'}
                      </Button>
                      <Button onClick={() => setEditingGalleryId(null)} variant="ghost" size="sm">Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ARTISTS */}
      {tab === 'artists' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-xl text-ink-900">Artists</h2>
            <Button onClick={() => setShowArtistForm(!showArtistForm)} variant="gold" size="sm">
              <Plus size={14} /> New Artist
            </Button>
          </div>

          {showArtistForm && (
            <div className="bg-card border border-ink-200 rounded-lg p-5 mb-5 space-y-4">
              <h3 className="font-medium text-ink-900">Add Artist</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Name *</Label>
                  <Input value={artistForm.name} onChange={(e) => setArtistForm({ ...artistForm, name: e.target.value })} placeholder="Artist name" />
                </div>
                <div>
                  <Label>Nationality</Label>
                  <Input value={artistForm.nationality} onChange={(e) => setArtistForm({ ...artistForm, nationality: e.target.value })} />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={artistForm.city} onChange={(e) => setArtistForm({ ...artistForm, city: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Bio</Label>
                  <RichTextEditor
                    value={artistForm.bio}
                    onChange={(html) => setArtistForm({ ...artistForm, bio: html })}
                    placeholder="Artist bio…"
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input type="url" value={artistForm.website} onChange={(e) => setArtistForm({ ...artistForm, website: e.target.value })} />
                </div>
                <div>
                  <Label>Instagram</Label>
                  <Input value={artistForm.instagram} onChange={(e) => setArtistForm({ ...artistForm, instagram: e.target.value })} placeholder="@handle" />
                </div>
                <div className="flex items-center gap-4 sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={artistForm.open_to_collaboration} onChange={(e) => setArtistForm({ ...artistForm, open_to_collaboration: e.target.checked })} className="rounded border-ink-300" />
                    Open to collaboration
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={artistForm.is_verified} onChange={(e) => setArtistForm({ ...artistForm, is_verified: e.target.checked })} className="rounded border-ink-300" />
                    Verified
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveArtist} disabled={saving} variant="primary" size="sm">{saving ? 'Saving...' : 'Create Artist'}</Button>
                <Button onClick={() => setShowArtistForm(false)} variant="ghost" size="sm">Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {artists.map((artist) => (
              <div key={artist.id} className="bg-card border border-ink-200 rounded-lg">
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <button
                      type="button"
                      className="text-left text-sm font-medium text-ink-900 hover:underline flex items-center gap-1"
                      title="Edit artist"
                      onClick={() => {
                        if (editingArtistId === artist.id) {
                          setEditingArtistId(null)
                          return
                        }
                        setEditingArtistId(artist.id)
                        setEditArtistForm({
                          name: artist.name || '',
                          nationality: artist.nationality || '',
                          city: artist.city || '',
                          bio: artist.bio || '',
                          website: artist.website || '',
                          instagram: artist.instagram || '',
                          open_to_collaboration: !!artist.open_to_collaboration,
                          is_verified: !!artist.is_verified,
                        })
                        setEditArtistGalleryIds(Object.entries(galleryArtists).filter(([, ids]) => ids.includes(artist.id)).map(([gid]) => gid))
                        setEditArtistEventIds(Object.entries(eventArtists).filter(([, ids]) => ids.includes(artist.id)).map(([eid]) => eid))
                        setEditArtistNewsIds(news.filter((n) => n.related_artist_id === artist.id).map((n) => n.id))
                      }}
                    >
                      {artist.name}
                      {artist.is_verified && <CheckCircle size={13} className="text-blue-500" />}
                    </button>
                  <p className="text-xs text-ink-500">{artist.nationality} · {artist.city}</p>
                  </div>
                  <div className="flex items-center gap-2">
                  {artist.pro_subscription_active && <Badge variant="pro">PRO</Badge>}
                  <label className="text-xs px-2 py-1 rounded border border-ink-200 bg-ink-50 text-ink-600 hover:border-ink-300 cursor-pointer">
                    {uploadingKey === `artist:${artist.id}` ? 'Uploading…' : 'Upload image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingKey !== null}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        void uploadImageAndUpdate({
                          entityType: 'artist',
                          entityId: artist.id,
                          file: f,
                          table: 'artists',
                          field: 'profile_image_url',
                        })
                        e.currentTarget.value = ''
                      }}
                    />
                  </label>
                  <button
                    onClick={() => toggleVerifiedArtist(artist.id, artist.is_verified)}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${artist.is_verified ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-ink-50 text-ink-500 border-ink-200 hover:border-blue-200'}`}
                  >
                    {artist.is_verified ? '✓ Verified' : 'Verify'}
                  </button>
                  <button onClick={() => deleteArtist(artist.id)} className="p-1.5 text-ink-400 hover:text-red-600 transition-colors" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
                {editingArtistId === artist.id && (
                  <div className="border-t border-ink-200 px-4 py-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Label>Name *</Label>
                        <Input value={editArtistForm.name} onChange={(e) => setEditArtistForm({ ...editArtistForm, name: e.target.value })} />
                      </div>
                      <div>
                        <Label>Nationality</Label>
                        <Input value={editArtistForm.nationality} onChange={(e) => setEditArtistForm({ ...editArtistForm, nationality: e.target.value })} />
                      </div>
                      <div>
                        <Label>City</Label>
                        <Input value={editArtistForm.city} onChange={(e) => setEditArtistForm({ ...editArtistForm, city: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Bio</Label>
                        <RichTextEditor
                          value={editArtistForm.bio}
                          onChange={(html) => setEditArtistForm({ ...editArtistForm, bio: html })}
                          placeholder="Artist bio…"
                        />
                      </div>
                      <div>
                        <Label>Website</Label>
                        <Input type="url" value={editArtistForm.website} onChange={(e) => setEditArtistForm({ ...editArtistForm, website: e.target.value })} />
                      </div>
                      <div>
                        <Label>Instagram</Label>
                        <Input value={editArtistForm.instagram} onChange={(e) => setEditArtistForm({ ...editArtistForm, instagram: e.target.value })} />
                      </div>
                      <div className="flex items-center gap-4 sm:col-span-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editArtistForm.open_to_collaboration} onChange={(e) => setEditArtistForm({ ...editArtistForm, open_to_collaboration: e.target.checked })} className="rounded border-ink-300" />
                          Open to collaboration
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editArtistForm.is_verified} onChange={(e) => setEditArtistForm({ ...editArtistForm, is_verified: e.target.checked })} className="rounded border-ink-300" />
                          Verified
                        </label>
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Galleries</Label>
                        <MultiSelect
                          options={galleries.map((g) => ({ id: g.id, label: g.name }))}
                          value={editArtistGalleryIds}
                          onChange={setEditArtistGalleryIds}
                          placeholder="Select galleries…"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Events</Label>
                        <MultiSelect
                          options={events.map((e) => ({ id: e.id, label: e.title }))}
                          value={editArtistEventIds}
                          onChange={setEditArtistEventIds}
                          placeholder="Select events…"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>News (related to this artist)</Label>
                        <MultiSelect
                          options={news.map((n) => ({ id: n.id, label: n.title }))}
                          value={editArtistNewsIds}
                          onChange={setEditArtistNewsIds}
                          placeholder="Select news…"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => updateArtist(artist.id)} disabled={saving} variant="primary" size="sm">
                        {saving ? 'Saving...' : 'Save changes'}
                      </Button>
                      <Button onClick={() => setEditingArtistId(null)} variant="ghost" size="sm">Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EVENTS */}
      {tab === 'events' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-xl text-ink-900">Events</h2>
            <Button onClick={() => setShowEventForm(!showEventForm)} variant="gold" size="sm">
              <Plus size={14} /> New Event
            </Button>
          </div>

          {showEventForm && (
            <div className="bg-card border border-ink-200 rounded-lg p-5 mb-5 space-y-4">
              <h3 className="font-medium text-ink-900">Add Event</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Title *</Label>
                  <Input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Event title" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <RichTextEditor
                    value={eventForm.description}
                    onChange={(html) => setEventForm({ ...eventForm, description: html })}
                    placeholder="Event description…"
                  />
                </div>
                <div>
                  <Label>Start date</Label>
                  <Input type="datetime-local" value={eventForm.start_date} onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })} />
                </div>
                <div>
                  <Label>End date</Label>
                  <Input type="datetime-local" value={eventForm.end_date} onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })} />
                </div>
                <div>
                  <Label>Opening (optional)</Label>
                  <Input type="datetime-local" value={eventForm.opening_date} onChange={(e) => setEventForm({ ...eventForm, opening_date: e.target.value })} />
                </div>
                      <div>
                        <Label>Location</Label>
                        <Input value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Latitude (map)</Label>
                          <Input type="number" step="any" placeholder="e.g. 25.2048" value={eventForm.lat} onChange={(e) => setEventForm({ ...eventForm, lat: e.target.value })} />
                        </div>
                        <div>
                          <Label>Longitude (map)</Label>
                          <Input type="number" step="any" placeholder="e.g. 55.2708" value={eventForm.lng} onChange={(e) => setEventForm({ ...eventForm, lng: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <Label>Gallery</Label>
                  <Select value={eventForm.gallery_id} onChange={(e) => setEventForm({ ...eventForm, gallery_id: e.target.value })}>
                    <option value="">— No gallery —</option>
                    {galleries.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Event type</Label>
                  <Select value={eventForm.event_type} onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}>
                    {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Ticket info</Label>
                  <Input value={eventForm.ticket_info} onChange={(e) => setEventForm({ ...eventForm, ticket_info: e.target.value })} placeholder="e.g. Free entry, AED 50" />
                </div>
                <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={eventForm.vip_access} onChange={(e) => setEventForm({ ...eventForm, vip_access: e.target.checked })} className="rounded border-ink-300" />
                    VIP access
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={eventForm.is_featured} onChange={(e) => setEventForm({ ...eventForm, is_featured: e.target.checked })} className="rounded border-ink-300" />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={eventForm.is_for_kids} onChange={(e) => setEventForm({ ...eventForm, is_for_kids: e.target.checked })} className="rounded border-ink-300" />
                    For kids
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEvent} disabled={saving} variant="primary" size="sm">{saving ? 'Saving...' : 'Create Event'}</Button>
                <Button onClick={() => setShowEventForm(false)} variant="ghost" size="sm">Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {events.map((event) => (
              <div key={event.id} className="bg-card border border-ink-200 rounded-lg">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {event.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={event.image_url} alt="" className="w-16 h-12 rounded object-cover border border-ink-200 shrink-0" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getPlaceholderImage('event', event.slug)} alt="" className="w-16 h-12 rounded object-cover border border-ink-200 shrink-0 opacity-60" />
                    )}
                    <EventTypeBadge type={event.event_type} size="sm" />
                    <div className="min-w-0">
                      <button
                        type="button"
                        className="text-left text-sm font-medium text-ink-900 truncate hover:underline"
                        title="Edit event"
                        onClick={() => {
                          if (editingEventId === event.id) {
                            setEditingEventId(null)
                            return
                          }
                          setEditingEventId(event.id)
                          setEditEventForm({
                            title: event.title || '',
                            description: event.description || '',
                            start_date: event.start_date ? event.start_date.slice(0, 16) : '',
                            end_date: event.end_date ? event.end_date.slice(0, 16) : '',
                            opening_date: event.opening_date ? event.opening_date.slice(0, 16) : '',
                            location: event.location || '',
                            gallery_id: (event.gallery_id || '') as string,
                            event_type: (event.event_type || 'exhibition') as string,
                            ticket_info: event.ticket_info || '',
                            vip_access: !!event.vip_access,
                            is_featured: !!event.is_featured,
                            is_for_kids: !!event.is_for_kids,
                            lat: event.lat != null ? String(event.lat) : '',
                            lng: event.lng != null ? String(event.lng) : '',
                          })
                          setEditEventArtistIds(eventArtists[event.id] || [])
                        }}
                      >
                        {event.title}
                      </button>
                      <p className="text-xs text-ink-500">{formatDate(event.start_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                  <label className="text-xs px-2 py-1 rounded border border-ink-200 bg-ink-50 text-ink-600 hover:border-ink-300 cursor-pointer">
                    {uploadingKey === `event:${event.id}` ? 'Uploading…' : 'Upload image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingKey !== null}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        void uploadImageAndUpdate({
                          entityType: 'event',
                          entityId: event.id,
                          file: f,
                          table: 'events',
                          field: 'image_url',
                        })
                        e.currentTarget.value = ''
                      }}
                    />
                  </label>
                  <button
                    onClick={() => toggleFeaturedEvent(event.id, event.is_featured)}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${event.is_featured ? 'bg-gold-100 text-gold-700 border-gold-300' : 'bg-ink-50 text-ink-500 border-ink-200 hover:border-gold-300'}`}
                  >
                    {event.is_featured ? '★ Featured' : '☆ Feature'}
                  </button>
                  <button onClick={() => deleteEvent(event.id)} className="p-1.5 text-ink-400 hover:text-red-600 transition-colors" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
                {editingEventId === event.id && (
                  <div className="border-t border-ink-200 px-4 py-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Label>Title *</Label>
                        <Input value={editEventForm.title} onChange={(e) => setEditEventForm({ ...editEventForm, title: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Description</Label>
                        <RichTextEditor
                          value={editEventForm.description}
                          onChange={(html) => setEditEventForm({ ...editEventForm, description: html })}
                          placeholder="Event description…"
                        />
                      </div>
                      <div>
                        <Label>Start date</Label>
                        <Input type="datetime-local" value={editEventForm.start_date} onChange={(e) => setEditEventForm({ ...editEventForm, start_date: e.target.value })} />
                      </div>
                      <div>
                        <Label>End date</Label>
                        <Input type="datetime-local" value={editEventForm.end_date} onChange={(e) => setEditEventForm({ ...editEventForm, end_date: e.target.value })} />
                      </div>
                      <div>
                        <Label>Opening (optional)</Label>
                        <Input type="datetime-local" value={editEventForm.opening_date} onChange={(e) => setEditEventForm({ ...editEventForm, opening_date: e.target.value })} />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input value={editEventForm.location} onChange={(e) => setEditEventForm({ ...editEventForm, location: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Latitude (map)</Label>
                          <Input type="number" step="any" placeholder="e.g. 25.2048" value={editEventForm.lat} onChange={(e) => setEditEventForm({ ...editEventForm, lat: e.target.value })} />
                        </div>
                        <div>
                          <Label>Longitude (map)</Label>
                          <Input type="number" step="any" placeholder="e.g. 55.2708" value={editEventForm.lng} onChange={(e) => setEditEventForm({ ...editEventForm, lng: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <Label>Gallery</Label>
                        <Select value={editEventForm.gallery_id} onChange={(e) => setEditEventForm({ ...editEventForm, gallery_id: e.target.value })}>
                          <option value="">— No gallery —</option>
                          {galleries.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </Select>
                      </div>
                      <div>
                        <Label>Event type</Label>
                        <Select value={editEventForm.event_type} onChange={(e) => setEditEventForm({ ...editEventForm, event_type: e.target.value })}>
                          {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Artists</Label>
                        <MultiSelect
                          options={artists.map((a) => ({ id: a.id, label: a.name }))}
                          value={editEventArtistIds}
                          onChange={setEditEventArtistIds}
                          placeholder="Select artists…"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Ticket info</Label>
                        <Input value={editEventForm.ticket_info} onChange={(e) => setEditEventForm({ ...editEventForm, ticket_info: e.target.value })} />
                      </div>
                      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editEventForm.vip_access} onChange={(e) => setEditEventForm({ ...editEventForm, vip_access: e.target.checked })} className="rounded border-ink-300" />
                          VIP access
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editEventForm.is_featured} onChange={(e) => setEditEventForm({ ...editEventForm, is_featured: e.target.checked })} className="rounded border-ink-300" />
                          Featured
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editEventForm.is_for_kids} onChange={(e) => setEditEventForm({ ...editEventForm, is_for_kids: e.target.checked })} className="rounded border-ink-300" />
                          For kids
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => updateEvent(event.id)} disabled={saving} variant="primary" size="sm">
                        {saving ? 'Saving...' : 'Save changes'}
                      </Button>
                      <Button onClick={() => setEditingEventId(null)} variant="ghost" size="sm">Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEWS */}
      {tab === 'news' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-xl text-ink-900">News Posts</h2>
            <Button onClick={() => setShowNewsForm(!showNewsForm)} variant="gold" size="sm">
              <Plus size={14} /> New Post
            </Button>
          </div>

          {showNewsForm && (
            <div className="bg-card border border-ink-200 rounded-lg p-5 mb-5 space-y-4">
              <h3 className="font-medium text-ink-900">Create News Post</h3>
              <div>
                <Label>Title</Label>
                <Input value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} />
              </div>
              <div>
                <Label>Content (HTML/Markdown)</Label>
                <RichTextEditor
                  value={newsForm.content}
                  onChange={(html) => setNewsForm({ ...newsForm, content: html })}
                  placeholder="Write your news post…"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Publish Date</Label>
                  <Input type="datetime-local" value={newsForm.publish_date} onChange={(e) => setNewsForm({ ...newsForm, publish_date: e.target.value })} />
                </div>
                <div>
                  <Label>Related Gallery</Label>
                  <Select value={newsForm.related_gallery_id} onChange={(e) => setNewsForm({ ...newsForm, related_gallery_id: e.target.value })}>
                    <option value="">— None —</option>
                    {galleries.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Related Artist</Label>
                  <Select value={newsForm.related_artist_id} onChange={(e) => setNewsForm({ ...newsForm, related_artist_id: e.target.value })}>
                    <option value="">— None —</option>
                    {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Related Collaboration</Label>
                  <Select value={newsForm.related_collaboration_id} onChange={(e) => setNewsForm({ ...newsForm, related_collaboration_id: e.target.value })}>
                    <option value="">— None —</option>
                    {collaborations.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveNews} disabled={saving} variant="primary" size="sm">
                  {saving ? 'Saving...' : 'Publish Post'}
                </Button>
                <Button onClick={() => setShowNewsForm(false)} variant="ghost" size="sm">Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {news.map((post) => (
              <div key={post.id} className="bg-card border border-ink-200 rounded-lg">
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <button
                      type="button"
                      className="text-left text-sm font-medium text-ink-900 hover:underline"
                      title="Edit news"
                      onClick={() => {
                        if (editingNewsId === post.id) {
                          setEditingNewsId(null)
                          return
                        }
                        setEditingNewsId(post.id)
                        setEditNewsForm({
                          title: post.title || '',
                          content: post.content || '',
                          publish_date: post.publish_date ? post.publish_date.slice(0, 16) : '',
                          related_gallery_id: post.related_gallery_id || '',
                          related_artist_id: post.related_artist_id || '',
                          related_collaboration_id: post.related_collaboration_id || '',
                        })
                      }}
                    >
                      {post.title}
                    </button>
                    <p className="text-xs text-ink-500">{formatDate(post.publish_date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                  <label className="text-xs px-2 py-1 rounded border border-ink-200 bg-ink-50 text-ink-600 hover:border-ink-300 cursor-pointer">
                    {uploadingKey === `news:${post.id}` ? 'Uploading…' : 'Upload image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingKey !== null}
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        void uploadImageAndUpdate({
                          entityType: 'news',
                          entityId: post.id,
                          file: f,
                          table: 'news',
                          field: 'cover_image_url',
                        })
                        e.currentTarget.value = ''
                      }}
                    />
                  </label>
                  <button onClick={() => deleteNews(post.id)} className="p-1.5 text-ink-400 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
                {editingNewsId === post.id && (
                  <div className="border-t border-ink-200 px-4 py-4 space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Title *</Label>
                        <Input value={editNewsForm.title} onChange={(e) => setEditNewsForm({ ...editNewsForm, title: e.target.value })} />
                      </div>
                      <div>
                        <Label>Content (HTML/Markdown)</Label>
                        <RichTextEditor
                          value={editNewsForm.content}
                          onChange={(html) => setEditNewsForm({ ...editNewsForm, content: html })}
                          placeholder="Write your news post…"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Publish Date</Label>
                          <Input type="datetime-local" value={editNewsForm.publish_date} onChange={(e) => setEditNewsForm({ ...editNewsForm, publish_date: e.target.value })} />
                        </div>
                        <div>
                          <Label>Related Gallery</Label>
                          <Select value={editNewsForm.related_gallery_id} onChange={(e) => setEditNewsForm({ ...editNewsForm, related_gallery_id: e.target.value })}>
                            <option value="">— None —</option>
                            {galleries.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                          </Select>
                        </div>
                        <div>
                          <Label>Related Artist</Label>
                          <Select value={editNewsForm.related_artist_id} onChange={(e) => setEditNewsForm({ ...editNewsForm, related_artist_id: e.target.value })}>
                            <option value="">— None —</option>
                            {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </Select>
                        </div>
                        <div>
                          <Label>Related Collaboration</Label>
                          <Select value={editNewsForm.related_collaboration_id} onChange={(e) => setEditNewsForm({ ...editNewsForm, related_collaboration_id: e.target.value })}>
                            <option value="">— None —</option>
                            {collaborations.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => updateNews(post.id)} disabled={saving} variant="primary" size="sm">
                        {saving ? 'Saving...' : 'Save changes'}
                      </Button>
                      <Button onClick={() => setEditingNewsId(null)} variant="ghost" size="sm">Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COLLABORATIONS */}
      {tab === 'collaborations' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-xl text-ink-900">Collaboration</h2>
            <Button onClick={() => setShowCollaborationForm(!showCollaborationForm)} variant="gold" size="sm">
              <Plus size={14} /> New Listing
            </Button>
          </div>

          {showCollaborationForm && (
            <div className="bg-card border border-ink-200 rounded-lg p-5 mb-5 space-y-4">
              <h3 className="font-medium text-ink-900">Add Open Call / Competition</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Title *</Label>
                  <Input value={collaborationForm.title} onChange={(e) => setCollaborationForm({ ...collaborationForm, title: e.target.value })} placeholder="Listing title" />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select value={collaborationForm.category} onChange={(e) => setCollaborationForm({ ...collaborationForm, category: e.target.value })}>
                    {COLLABORATION_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Regions</Label>
                  <MultiSelect
                    options={COLLABORATION_REGIONS.map((r) => ({ id: r.value, label: r.label }))}
                    value={collaborationForm.regions}
                    onChange={(regions) => setCollaborationForm({ ...collaborationForm, regions })}
                    placeholder="Select regions…"
                  />
                </div>
                <div>
                  <Label>Deadline</Label>
                  <Input type="datetime-local" value={collaborationForm.deadline} onChange={(e) => setCollaborationForm({ ...collaborationForm, deadline: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Poster image</Label>
                  <div className="flex flex-wrap items-start gap-4 mt-1">
                    {collaborationPosterPreview && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={collaborationPosterPreview} alt="Poster preview" className="w-32 h-24 object-cover rounded border border-ink-200" />
                    )}
                    <label className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded border border-ink-200 bg-ink-50 text-ink-700 hover:border-ink-300 cursor-pointer">
                      {collaborationPosterFile ? 'Change poster' : 'Upload poster'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          handleCollaborationPosterSelect(e.target.files?.[0], 'create')
                          e.currentTarget.value = ''
                        }}
                      />
                    </label>
                    {collaborationPosterFile && (
                      <button type="button" className="text-sm text-ink-500 hover:text-red-600" onClick={clearCollaborationPosterDraft}>
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-ink-500 mt-1">Shown as the cover on listing cards and the detail page.</p>
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <RichTextEditor
                    value={collaborationForm.description}
                    onChange={(html) => setCollaborationForm({ ...collaborationForm, description: html })}
                    placeholder="Full description…"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Application / submission link</Label>
                  <Input value={collaborationForm.external_link} onChange={(e) => setCollaborationForm({ ...collaborationForm, external_link: e.target.value })} placeholder="https://…" />
                  <p className="text-xs text-ink-500 mt-1">UTM tracking is added automatically on the public page.</p>
                </div>
                <div>
                  <Label>Contact email</Label>
                  <Input type="email" value={collaborationForm.contact_email} onChange={(e) => setCollaborationForm({ ...collaborationForm, contact_email: e.target.value })} placeholder="submissions@gallery.com" />
                </div>
                <div>
                  <Label>Contact WhatsApp</Label>
                  <Input value={collaborationForm.contact_whatsapp} onChange={(e) => setCollaborationForm({ ...collaborationForm, contact_whatsapp: e.target.value })} placeholder="+971501234567" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Contact notes (optional)</Label>
                  <Textarea value={collaborationForm.contact_info} onChange={(e) => setCollaborationForm({ ...collaborationForm, contact_info: e.target.value })} placeholder="Extra instructions, office hours, etc." rows={2} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Attachments</Label>
                  <div className="mt-1 space-y-2">
                    <label className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded border border-ink-200 bg-ink-50 text-ink-700 hover:border-ink-300 cursor-pointer">
                      <Paperclip size={14} />
                      Add file (PDF, Word, Excel, ZIP…)
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rtf,.odt,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          if (files.length > 0) {
                            setPendingCollaborationAttachments((prev) => [...prev, ...files])
                          }
                          e.currentTarget.value = ''
                        }}
                      />
                    </label>
                    {pendingCollaborationAttachments.length > 0 && (
                      <ul className="space-y-1">
                        {pendingCollaborationAttachments.map((file, i) => (
                          <li key={`${file.name}-${i}`} className="flex items-center justify-between gap-2 text-sm text-ink-700 bg-ink-50 border border-ink-200 rounded px-3 py-2">
                            <span className="truncate">{file.name} <span className="text-ink-400">({formatFileSize(file.size)})</span></span>
                            <button
                              type="button"
                              className="text-ink-400 hover:text-red-600 shrink-0"
                              onClick={() => setPendingCollaborationAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="text-xs text-ink-500 mt-1">Max 25 MB per file. Briefs, application forms, and guidelines.</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={collaborationForm.is_featured} onChange={(e) => setCollaborationForm({ ...collaborationForm, is_featured: e.target.checked })} className="rounded border-ink-300" />
                    Featured
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveCollaboration} disabled={saving} variant="primary" size="sm">{saving ? 'Saving...' : 'Create Listing'}</Button>
                <Button
                  onClick={() => {
                    setShowCollaborationForm(false)
                    clearCollaborationPosterDraft()
                    setPendingCollaborationAttachments([])
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {collaborations.map((item) => (
              <div key={item.id} className="bg-card border border-ink-200 rounded-lg">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.cover_image_url} alt="" className="w-16 h-12 rounded object-cover border border-ink-200 shrink-0" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getPlaceholderImage('collaboration', item.slug)} alt="" className="w-16 h-12 rounded object-cover border border-ink-200 shrink-0 opacity-60" />
                    )}
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CollaborationCategoryBadge category={item.category} size="sm" />
                        <CollaborationRegionBadges regions={item.regions} size="sm" />
                      </div>
                      <div className="min-w-0">
                      <button
                        type="button"
                        className="text-left text-sm font-medium text-ink-900 truncate hover:underline"
                        onClick={() => {
                          if (editingCollaborationId === item.id) {
                            setEditingCollaborationId(null)
                            clearEditCollaborationPosterDraft()
                            return
                          }
                          clearEditCollaborationPosterDraft()
                          setEditingCollaborationId(item.id)
                          setEditCollaborationForm({
                            title: item.title || '',
                            description: item.description || '',
                            category: item.category,
                            regions: item.regions || [],
                            external_link: item.external_link || '',
                            deadline: item.deadline ? item.deadline.slice(0, 16) : '',
                            contact_email: item.contact_email || '',
                            contact_whatsapp: item.contact_whatsapp || '',
                            contact_info: item.contact_info || '',
                            is_featured: !!item.is_featured,
                          })
                          setEditCollaborationNewsIds(news.filter((n) => n.related_collaboration_id === item.id).map((n) => n.id))
                        }}
                      >
                        {item.title}
                      </button>
                      <p className="text-xs text-ink-500">{item.deadline ? formatDate(item.deadline) : 'No deadline'}</p>
                    </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="text-xs px-2 py-1 rounded border border-ink-200 bg-ink-50 text-ink-600 hover:border-ink-300 cursor-pointer">
                      {uploadingKey === `collaboration:${item.id}` ? 'Uploading…' : 'Poster'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingKey !== null}
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (!f) return
                          void uploadCollaborationPoster(item.id, f)
                          e.currentTarget.value = ''
                        }}
                      />
                    </label>
                    <label className="text-xs px-2 py-1 rounded border border-ink-200 bg-ink-50 text-ink-600 hover:border-ink-300 cursor-pointer">
                      {uploadingKey === `collaboration-photo:${item.id}` ? 'Uploading…' : 'Add photo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingKey !== null}
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (!f) return
                          void uploadCollaborationPhoto(item.id, f)
                          e.currentTarget.value = ''
                        }}
                      />
                    </label>
                    <label className="text-xs px-2 py-1 rounded border border-ink-200 bg-ink-50 text-ink-600 hover:border-ink-300 cursor-pointer">
                      {uploadingKey === `collaboration-attachment:${item.id}` ? 'Uploading…' : 'Attach file'}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rtf,.odt,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        disabled={uploadingKey !== null}
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (!f) return
                          void uploadCollaborationAttachment(item.id, f)
                          e.currentTarget.value = ''
                        }}
                      />
                    </label>
                    <button
                      onClick={() => toggleFeaturedCollaboration(item.id, item.is_featured)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${item.is_featured ? 'bg-gold-100 text-gold-700 border-gold-300' : 'bg-ink-50 text-ink-500 border-ink-200 hover:border-gold-300'}`}
                    >
                      {item.is_featured ? '★ Featured' : '☆ Feature'}
                    </button>
                    <button onClick={() => deleteCollaboration(item.id)} className="p-1.5 text-ink-400 hover:text-red-600 transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {editingCollaborationId === item.id && (
                  <div className="border-t border-ink-200 px-4 py-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Label>Title *</Label>
                        <Input value={editCollaborationForm.title} onChange={(e) => setEditCollaborationForm({ ...editCollaborationForm, title: e.target.value })} />
                      </div>
                      <div>
                        <Label>Category *</Label>
                        <Select value={editCollaborationForm.category} onChange={(e) => setEditCollaborationForm({ ...editCollaborationForm, category: e.target.value })}>
                          {COLLABORATION_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </Select>
                      </div>
                      <div>
                        <Label>Regions</Label>
                        <MultiSelect
                          options={COLLABORATION_REGIONS.map((r) => ({ id: r.value, label: r.label }))}
                          value={editCollaborationForm.regions}
                          onChange={(regions) => setEditCollaborationForm({ ...editCollaborationForm, regions })}
                          placeholder="Select regions…"
                        />
                      </div>
                      <div>
                        <Label>Deadline</Label>
                        <Input type="datetime-local" value={editCollaborationForm.deadline} onChange={(e) => setEditCollaborationForm({ ...editCollaborationForm, deadline: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Poster image</Label>
                        <div className="flex flex-wrap items-start gap-4 mt-1">
                          {(editCollaborationPosterPreview || item.cover_image_url) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={editCollaborationPosterPreview || item.cover_image_url || ''}
                              alt="Poster preview"
                              className="w-40 h-28 object-cover rounded border border-ink-200"
                            />
                          )}
                          <label className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded border border-ink-200 bg-ink-50 text-ink-700 hover:border-ink-300 cursor-pointer">
                            {item.cover_image_url || editCollaborationPosterFile ? 'Replace poster' : 'Upload poster'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleCollaborationPosterSelect(e.target.files?.[0], 'edit')
                                e.currentTarget.value = ''
                              }}
                            />
                          </label>
                          {(editCollaborationPosterFile || item.cover_image_url) && (
                            <button
                              type="button"
                              className="text-sm text-ink-500 hover:text-red-600"
                              onClick={() => {
                                clearEditCollaborationPosterDraft()
                                void supabase.from('collaborations').update({ cover_image_url: null }).eq('id', item.id).then(() => router.refresh())
                              }}
                            >
                              Remove poster
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Description</Label>
                        <RichTextEditor
                          value={editCollaborationForm.description}
                          onChange={(html) => setEditCollaborationForm({ ...editCollaborationForm, description: html })}
                          placeholder="Full description…"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Application / submission link</Label>
                        <Input value={editCollaborationForm.external_link} onChange={(e) => setEditCollaborationForm({ ...editCollaborationForm, external_link: e.target.value })} />
                      </div>
                      <div>
                        <Label>Contact email</Label>
                        <Input type="email" value={editCollaborationForm.contact_email} onChange={(e) => setEditCollaborationForm({ ...editCollaborationForm, contact_email: e.target.value })} />
                      </div>
                      <div>
                        <Label>Contact WhatsApp</Label>
                        <Input value={editCollaborationForm.contact_whatsapp} onChange={(e) => setEditCollaborationForm({ ...editCollaborationForm, contact_whatsapp: e.target.value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Contact notes (optional)</Label>
                        <Textarea value={editCollaborationForm.contact_info} onChange={(e) => setEditCollaborationForm({ ...editCollaborationForm, contact_info: e.target.value })} rows={2} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Attachments</Label>
                        <div className="mt-1 space-y-2">
                          <label className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded border border-ink-200 bg-ink-50 text-ink-700 hover:border-ink-300 cursor-pointer">
                            <Paperclip size={14} />
                            Add file
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rtf,.odt,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              className="hidden"
                              disabled={uploadingKey !== null}
                              onChange={(e) => {
                                const f = e.target.files?.[0]
                                if (!f) return
                                void uploadCollaborationAttachment(item.id, f)
                                e.currentTarget.value = ''
                              }}
                            />
                          </label>
                          {item.attachments.length > 0 && (
                            <ul className="space-y-1">
                              {item.attachments.map((att) => (
                                <li key={att.url} className="flex items-center justify-between gap-2 text-sm text-ink-700 bg-ink-50 border border-ink-200 rounded px-3 py-2">
                                  <a href={att.url} target="_blank" rel="noopener noreferrer" className="truncate hover:text-gold-600">
                                    {att.name}
                                    {att.size ? <span className="text-ink-400"> ({formatFileSize(att.size)})</span> : null}
                                  </a>
                                  <button
                                    type="button"
                                    className="text-ink-400 hover:text-red-600 shrink-0"
                                    onClick={() => removeCollaborationAttachment(item.id, att.url)}
                                  >
                                    Remove
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <Label>News (related to this collaboration)</Label>
                        <MultiSelect
                          options={news.map((n) => ({ id: n.id, label: n.title }))}
                          value={editCollaborationNewsIds}
                          onChange={setEditCollaborationNewsIds}
                          placeholder="Select news…"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editCollaborationForm.is_featured} onChange={(e) => setEditCollaborationForm({ ...editCollaborationForm, is_featured: e.target.checked })} className="rounded border-ink-300" />
                          Featured
                        </label>
                      </div>
                      {item.photos.length > 0 && (
                        <div className="sm:col-span-2">
                          <Label>Photos</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.photos.map((url) => (
                              <div key={url} className="relative group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="" className="w-20 h-16 object-cover rounded border border-ink-200" />
                                <button
                                  type="button"
                                  onClick={() => removeCollaborationPhoto(item.id, url)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs opacity-0 group-hover:opacity-100"
                                  title="Remove photo"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => updateCollaboration(item.id)} disabled={saving} variant="primary" size="sm">
                        {saving ? 'Saving...' : 'Save changes'}
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingCollaborationId(null)
                          clearEditCollaborationPosterDraft()
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBSCRIBERS */}
      {tab === 'subscribers' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200">
                <th className="text-left py-2 px-3 text-ink-600 font-medium">Name</th>
                <th className="text-left py-2 px-3 text-ink-600 font-medium">Email</th>
                <th className="text-left py-2 px-3 text-ink-600 font-medium">Phone</th>
                <th className="text-left py-2 px-3 text-ink-600 font-medium">Source</th>
                <th className="text-left py-2 px-3 text-ink-600 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-b border-ink-100 hover:bg-ink-50">
                  <td className="py-2 px-3 text-ink-900">{sub.name}</td>
                  <td className="py-2 px-3 text-ink-600">{sub.email}</td>
                  <td className="py-2 px-3 text-ink-600">{sub.phone || '—'}</td>
                  <td className="py-2 px-3">
                    <span className="text-xs bg-ink-100 text-ink-600 px-2 py-0.5 rounded">{sub.source_type}</span>
                  </td>
                  <td className="py-2 px-3 text-ink-500">{formatDate(sub.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
