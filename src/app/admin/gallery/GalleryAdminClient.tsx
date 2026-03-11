'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Calendar, Users, Star, CreditCard, Pencil, Trash2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Label, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { EventTypeBadge } from '@/components/ui/EventTypeBadge'
import { formatDate, slugify, EVENT_TYPES, GALLERY_AREAS, GALLERY_TYPES } from '@/lib/utils'
import { PAYMENTS_DISABLED } from '@/lib/constants'
import type { Gallery, Event, Subscriber, Artist } from '@/types'

type Tab = 'profile' | 'events' | 'artists' | 'subscribers' | 'billing'

interface Props {
  gallery: Gallery
  events: Event[]
  subscribers: Subscriber[]
  artists: Artist[]
}

export function GalleryAdminClient({ gallery, events, subscribers, artists }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('profile')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [profileForm, setProfileForm] = useState({
    name: gallery.name || '',
    description: gallery.description || '',
    address: gallery.address || '',
    area: gallery.area || '',
    type: gallery.type || '',
    website: gallery.website || '',
    instagram: gallery.instagram || '',
    email: gallery.email || '',
    phone: gallery.phone || '',
    submission_policy: gallery.submission_policy || '',
    founded_year: String(gallery.founded_year || ''),
  })

  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_type: 'exhibition',
    start_date: '',
    end_date: '',
    opening_date: '',
    location: '',
    ticket_info: '',
    vip_access: false,
    external_link: '',
  })

  const supabase = createClient()

  async function saveProfile() {
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('galleries').update({
      ...profileForm,
      slug: slugify(profileForm.name),
      founded_year: profileForm.founded_year ? parseInt(profileForm.founded_year) : null,
    }).eq('id', gallery.id)

    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'Profile saved!')
    if (!error) router.refresh()
  }

  function startEditEvent(event: Event) {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type || 'exhibition',
      start_date: event.start_date?.slice(0, 16) || '',
      end_date: event.end_date?.slice(0, 16) || '',
      opening_date: event.opening_date?.slice(0, 16) || '',
      location: event.location || '',
      ticket_info: event.ticket_info || '',
      vip_access: event.vip_access,
      external_link: event.external_link || '',
    })
    setShowEventForm(true)
  }

  function resetEventForm() {
    setEditingEvent(null)
    setShowEventForm(false)
    setEventForm({
      title: '', description: '', event_type: 'exhibition',
      start_date: '', end_date: '', opening_date: '',
      location: '', ticket_info: '', vip_access: false, external_link: '',
    })
  }

  async function saveEvent() {
    setSaving(true)
    setMessage('')

    const payload = {
      ...eventForm,
      gallery_id: gallery.id,
      slug: slugify(eventForm.title),
      start_date: eventForm.start_date || null,
      end_date: eventForm.end_date || null,
      opening_date: eventForm.opening_date || null,
    }

    const { error } = editingEvent
      ? await supabase.from('events').update(payload).eq('id', editingEvent.id)
      : await supabase.from('events').insert(payload)

    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : editingEvent ? 'Event updated!' : 'Event created!')
    if (!error) { resetEventForm(); router.refresh() }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    router.refresh()
  }

  async function featureEvent(eventId: string) {
    // Stripe checkout for featuring event
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_type: 'feature_event', entity_id: eventId }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  async function subscribeGallery() {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_type: 'gallery_subscription', entity_id: gallery.id }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <Building2 size={15} /> },
    { id: 'events', label: `Events (${events.length})`, icon: <Calendar size={15} /> },
    { id: 'artists', label: `Artists (${artists.length})`, icon: <Users size={15} /> },
    { id: 'subscribers', label: `Subscribers (${subscribers.length})`, icon: <Star size={15} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={15} /> },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">{gallery.name}</h1>
          <p className="text-ink-500 text-sm mt-0.5">Gallery Admin Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          {gallery.subscription_active && <Badge variant="verified">Active Partner</Badge>}
          {gallery.is_featured && <Badge variant="gold">Featured</Badge>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-ink-200 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id
                ? 'border-gold-500 text-gold-700'
                : 'border-transparent text-ink-500 hover:text-ink-900'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {message && (
        <div className={`mb-4 px-4 py-2 rounded text-sm ${message.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message}
        </div>
      )}

      {/* PROFILE TAB */}
      {tab === 'profile' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Gallery Name</Label>
              <Input id="name" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="founded_year">Founded Year</Label>
              <Input id="founded_year" type="number" value={profileForm.founded_year} onChange={(e) => setProfileForm({ ...profileForm, founded_year: e.target.value })} />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} value={profileForm.description} onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Area</Label>
              <Select value={profileForm.area} onChange={(e) => setProfileForm({ ...profileForm, area: e.target.value })}>
                <option value="">Select area</option>
                {GALLERY_AREAS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={profileForm.type} onChange={(e) => setProfileForm({ ...profileForm, type: e.target.value })}>
                <option value="">Select type</option>
                {GALLERY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label htmlFor="website">Website</Label><Input id="website" value={profileForm.website} onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })} /></div>
            <div><Label htmlFor="instagram">Instagram</Label><Input id="instagram" value={profileForm.instagram} onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })} /></div>
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} /></div>
            <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} /></div>
          </div>

          <div>
            <Label htmlFor="submission_policy">Submission Policy</Label>
            <Textarea id="submission_policy" rows={3} value={profileForm.submission_policy} onChange={(e) => setProfileForm({ ...profileForm, submission_policy: e.target.value })} />
          </div>

          <Button onClick={saveProfile} disabled={saving} variant="primary">
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      )}

      {/* EVENTS TAB */}
      {tab === 'events' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-xl text-ink-900">Events</h2>
            <Button onClick={() => { resetEventForm(); setShowEventForm(true) }} variant="gold" size="sm">
              <Plus size={14} /> New Event
            </Button>
          </div>

          {showEventForm && (
            <div className="bg-white border border-ink-200 rounded-lg p-5 mb-6 space-y-4">
              <h3 className="font-medium text-ink-900">{editingEvent ? 'Edit Event' : 'New Event'}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={eventForm.event_type} onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}>
                    {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input type="datetime-local" value={eventForm.start_date} onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="datetime-local" value={eventForm.end_date} onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })} />
                </div>
                <div>
                  <Label>Opening Date/Time</Label>
                  <Input type="datetime-local" value={eventForm.opening_date} onChange={(e) => setEventForm({ ...eventForm, opening_date: e.target.value })} />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
                </div>
                <div>
                  <Label>Ticket Info</Label>
                  <Input value={eventForm.ticket_info} onChange={(e) => setEventForm({ ...eventForm, ticket_info: e.target.value })} />
                </div>
                <div>
                  <Label>External Link</Label>
                  <Input value={eventForm.external_link} onChange={(e) => setEventForm({ ...eventForm, external_link: e.target.value })} />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea rows={3} value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="vip_access"
                  checked={eventForm.vip_access}
                  onChange={(e) => setEventForm({ ...eventForm, vip_access: e.target.checked })}
                  className="w-4 h-4 accent-gold-500"
                />
                <Label htmlFor="vip_access" className="mb-0">VIP Access Event</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveEvent} disabled={saving} variant="primary" size="sm">
                  {saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
                <Button onClick={resetEventForm} variant="ghost" size="sm">Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {events.length === 0 && <p className="text-ink-500 text-sm">No events yet. Create your first event above.</p>}
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between bg-white border border-ink-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <EventTypeBadge type={event.event_type} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{event.title}</p>
                    <p className="text-xs text-ink-500">{formatDate(event.start_date)} – {formatDate(event.end_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!event.is_featured && (
                    PAYMENTS_DISABLED ? (
                      <span className="text-xs text-ink-400">Feature ($200) — coming soon</span>
                    ) : (
                      <Button onClick={() => featureEvent(event.id)} variant="outline" size="sm">
                        <Star size={12} /> Feature ($200)
                      </Button>
                    )
                  )}
                  {event.is_featured && <Badge variant="gold">Featured</Badge>}
                  <button onClick={() => startEditEvent(event)} className="p-1.5 text-ink-400 hover:text-ink-900 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteEvent(event.id)} className="p-1.5 text-ink-400 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ARTISTS TAB */}
      {tab === 'artists' && (
        <div>
          <h2 className="font-serif text-xl text-ink-900 mb-4">Associated Artists</h2>
          {artists.length === 0 ? (
            <p className="text-ink-500 text-sm">No artists associated yet. Contact super admin to link artists.</p>
          ) : (
            <div className="space-y-2">
              {artists.map((artist) => (
                <div key={artist.id} className="flex items-center justify-between bg-white border border-ink-200 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{artist.name}</p>
                    <p className="text-xs text-ink-500">{artist.nationality} · {artist.city}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBSCRIBERS TAB */}
      {tab === 'subscribers' && (
        <div>
          <h2 className="font-serif text-xl text-ink-900 mb-4">Gallery Subscribers</h2>
          {subscribers.length === 0 ? (
            <p className="text-ink-500 text-sm">No subscribers yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-200">
                    <th className="text-left py-2 px-3 text-ink-600 font-medium">Name</th>
                    <th className="text-left py-2 px-3 text-ink-600 font-medium">Email</th>
                    <th className="text-left py-2 px-3 text-ink-600 font-medium">Phone</th>
                    <th className="text-left py-2 px-3 text-ink-600 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="border-b border-ink-100 hover:bg-ink-50">
                      <td className="py-2 px-3 text-ink-900">{sub.name}</td>
                      <td className="py-2 px-3 text-ink-600">{sub.email}</td>
                      <td className="py-2 px-3 text-ink-600">{sub.phone || '—'}</td>
                      <td className="py-2 px-3 text-ink-500">{formatDate(sub.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* BILLING TAB */}
      {tab === 'billing' && (
        <div className="space-y-5">
          <div className="bg-white border border-ink-200 rounded-lg p-5">
            <h3 className="font-serif text-xl text-ink-900 mb-2">Gallery Partner Subscription</h3>
            <p className="text-ink-600 text-sm mb-4">
              $50/month — Priority listing in gallery directory, featured placement, and partner badge.
            </p>
            {gallery.subscription_active ? (
              <div>
                <Badge variant="verified" className="mb-2">Active Subscription</Badge>
                <p className="text-xs text-ink-500">Renews: {formatDate(gallery.subscription_ends_at)}</p>
              </div>
            ) : (
              PAYMENTS_DISABLED ? (
                <p className="text-sm text-ink-500">Payments coming soon.</p>
              ) : (
                <Button onClick={subscribeGallery} variant="gold">
                  <CreditCard size={15} /> Subscribe — $50/month
                </Button>
              )
            )}
          </div>

          <div className="bg-white border border-ink-200 rounded-lg p-5">
            <h3 className="font-serif text-xl text-ink-900 mb-2">Feature an Exhibition</h3>
            <p className="text-ink-600 text-sm mb-2">
              $200 one-time — Promote any exhibition to the homepage and featured listings.
            </p>
            <p className="text-xs text-ink-500">Select an event in the Events tab and click &quot;Feature ($200)&quot;.</p>
          </div>
        </div>
      )}
    </div>
  )
}
