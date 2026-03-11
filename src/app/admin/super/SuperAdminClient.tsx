'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Building2, User, Calendar, Newspaper, Users, Star, Trash2, CheckCircle, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Label, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { EventTypeBadge } from '@/components/ui/EventTypeBadge'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { formatDate, slugify, GALLERY_AREAS, GALLERY_TYPES, EVENT_TYPES } from '@/lib/utils'
import type { Gallery, Artist, Event, NewsPost, Subscriber } from '@/types'

type Tab = 'overview' | 'galleries' | 'artists' | 'events' | 'news' | 'subscribers'

interface Props {
  galleries: Gallery[]
  artists: Artist[]
  events: Event[]
  news: NewsPost[]
  subscribers: Subscriber[]
}

export function SuperAdminClient({ galleries, artists, events, news, subscribers }: Props) {
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

  const [editGalleryForm, setEditGalleryForm] = useState({
    name: '', description: '', address: '', area: '' as string, type: 'gallery' as string,
    website: '', instagram: '', email: '', phone: '', submission_policy: '', founded_year: '',
    is_featured: false, subscription_active: false,
  })

  const [editArtistForm, setEditArtistForm] = useState({
    name: '', nationality: '', city: '', bio: '', website: '', instagram: '',
    open_to_collaboration: false, is_verified: false,
  })

  const [editEventForm, setEditEventForm] = useState({
    title: '', description: '', start_date: '', end_date: '', opening_date: '', location: '',
    gallery_id: '' as string, event_type: 'exhibition' as string, ticket_info: '', vip_access: false, is_featured: false,
  })

  const [editNewsForm, setEditNewsForm] = useState({
    title: '', content: '', publish_date: '', related_gallery_id: '', related_artist_id: '',
  })

  // News form
  const [showNewsForm, setShowNewsForm] = useState(false)
  const [newsForm, setNewsForm] = useState({ title: '', content: '', publish_date: '', related_gallery_id: '', related_artist_id: '' })

  // Gallery form
  const [showGalleryForm, setShowGalleryForm] = useState(false)
  const [galleryForm, setGalleryForm] = useState({
    name: '', description: '', address: '', area: '' as string, type: 'gallery' as string,
    website: '', instagram: '', email: '', phone: '', submission_policy: '', founded_year: '',
    is_featured: false, subscription_active: false,
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
    gallery_id: '' as string, event_type: 'exhibition' as string, ticket_info: '', vip_access: false, is_featured: false,
  })

  const supabase = createClient()

  async function uploadImageAndUpdate(opts: {
    entityType: 'gallery' | 'event' | 'artist' | 'news'
    entityId: string
    file: File
    table: 'galleries' | 'events' | 'artists' | 'news'
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
      is_featured: editGalleryForm.is_featured,
      subscription_active: editGalleryForm.subscription_active,
    }).eq('id', id)
    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'Gallery updated!')
    if (!error) {
      setEditingGalleryId(null)
      router.refresh()
    }
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
    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'Artist updated!')
    if (!error) {
      setEditingArtistId(null)
      router.refresh()
    }
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
      gallery_id: editEventForm.gallery_id || null,
      event_type: (editEventForm.event_type as 'exhibition' | 'talk' | 'art_fair' | 'workshop' | 'opening' | 'performance') || null,
      ticket_info: editEventForm.ticket_info || null,
      vip_access: editEventForm.vip_access,
      is_featured: editEventForm.is_featured,
    }).eq('id', id)
    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'Event updated!')
    if (!error) {
      setEditingEventId(null)
      router.refresh()
    }
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
    })
    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'News post created!')
    if (!error) {
      setShowNewsForm(false)
      setNewsForm({ title: '', content: '', publish_date: '', related_gallery_id: '', related_artist_id: '' })
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
      is_featured: galleryForm.is_featured,
      subscription_active: galleryForm.subscription_active,
    })
    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'Gallery created!')
    if (!error) {
      setShowGalleryForm(false)
      setGalleryForm({ name: '', description: '', address: '', area: '', type: 'gallery', website: '', instagram: '', email: '', phone: '', submission_policy: '', founded_year: '', is_featured: false, subscription_active: false })
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
      gallery_id: eventForm.gallery_id || null,
      event_type: (eventForm.event_type as 'exhibition' | 'talk' | 'art_fair' | 'workshop' | 'opening' | 'performance') || null,
      ticket_info: eventForm.ticket_info || null,
      vip_access: eventForm.vip_access,
      is_featured: eventForm.is_featured,
    })
    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'Event created!')
    if (!error) {
      setShowEventForm(false)
      setEventForm({ title: '', description: '', start_date: '', end_date: '', opening_date: '', location: '', gallery_id: '', event_type: 'exhibition', ticket_info: '', vip_access: false, is_featured: false })
      router.refresh()
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    router.refresh()
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Shield size={14} /> },
    { id: 'galleries', label: 'Galleries', icon: <Building2 size={14} />, count: galleries.length },
    { id: 'artists', label: 'Artists', icon: <User size={14} />, count: artists.length },
    { id: 'events', label: 'Events', icon: <Calendar size={14} />, count: events.length },
    { id: 'news', label: 'News', icon: <Newspaper size={14} />, count: news.length },
    { id: 'subscribers', label: 'Subscribers', icon: <Users size={14} />, count: subscribers.length },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={20} className="text-gold-500" />
          <h1 className="font-serif text-3xl text-ink-900">Super Admin</h1>
        </div>
        <p className="text-ink-500 text-sm">Full control over all Dubai Art Radar content</p>
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
            { label: 'Subscribers', count: subscribers.length, sub: 'total', icon: Users },
            { label: 'Featured Galleries', count: galleries.filter(g => g.is_featured).length, sub: 'on homepage', icon: Star },
          ].map(({ label, count, sub, icon: Icon }) => (
            <div key={label} className="bg-white border border-ink-200 rounded-lg p-4">
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
            <div className="bg-white border border-ink-200 rounded-lg p-5 mb-5 space-y-4">
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
                <div>
                  <Label>Area</Label>
                  <Select value={galleryForm.area} onChange={(e) => setGalleryForm({ ...galleryForm, area: e.target.value })}>
                    <option value="">—</option>
                    {GALLERY_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={galleryForm.type} onChange={(e) => setGalleryForm({ ...galleryForm, type: e.target.value })}>
                    {GALLERY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
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
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={galleryForm.is_featured} onChange={(e) => setGalleryForm({ ...galleryForm, is_featured: e.target.checked })} className="rounded border-ink-300" />
                    Featured
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
              <div key={gallery.id} className="bg-white border border-ink-200 rounded-lg">
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
                          is_featured: !!gallery.is_featured,
                          subscription_active: !!gallery.subscription_active,
                        })
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
                      <div>
                        <Label>Area</Label>
                        <Select value={editGalleryForm.area} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, area: e.target.value })}>
                          <option value="">—</option>
                          {GALLERY_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                        </Select>
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select value={editGalleryForm.type} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, type: e.target.value })}>
                          {GALLERY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
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
                      <div className="flex items-center gap-4 sm:col-span-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editGalleryForm.is_featured} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, is_featured: e.target.checked })} className="rounded border-ink-300" />
                          Featured
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editGalleryForm.subscription_active} onChange={(e) => setEditGalleryForm({ ...editGalleryForm, subscription_active: e.target.checked })} className="rounded border-ink-300" />
                          Partner (subscription active)
                        </label>
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
            <div className="bg-white border border-ink-200 rounded-lg p-5 mb-5 space-y-4">
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
              <div key={artist.id} className="bg-white border border-ink-200 rounded-lg">
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
            <div className="bg-white border border-ink-200 rounded-lg p-5 mb-5 space-y-4">
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
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Ticket info</Label>
                  <Input value={eventForm.ticket_info} onChange={(e) => setEventForm({ ...eventForm, ticket_info: e.target.value })} placeholder="e.g. Free entry, AED 50" />
                </div>
                <div className="flex items-center gap-4 sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={eventForm.vip_access} onChange={(e) => setEventForm({ ...eventForm, vip_access: e.target.checked })} className="rounded border-ink-300" />
                    VIP access
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={eventForm.is_featured} onChange={(e) => setEventForm({ ...eventForm, is_featured: e.target.checked })} className="rounded border-ink-300" />
                    Featured
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
              <div key={event.id} className="bg-white border border-ink-200 rounded-lg">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
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
                          })
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
                          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Ticket info</Label>
                        <Input value={editEventForm.ticket_info} onChange={(e) => setEditEventForm({ ...editEventForm, ticket_info: e.target.value })} />
                      </div>
                      <div className="flex items-center gap-4 sm:col-span-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editEventForm.vip_access} onChange={(e) => setEditEventForm({ ...editEventForm, vip_access: e.target.checked })} className="rounded border-ink-300" />
                          VIP access
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={editEventForm.is_featured} onChange={(e) => setEditEventForm({ ...editEventForm, is_featured: e.target.checked })} className="rounded border-ink-300" />
                          Featured
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
            <div className="bg-white border border-ink-200 rounded-lg p-5 mb-5 space-y-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <div key={post.id} className="bg-white border border-ink-200 rounded-lg">
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
