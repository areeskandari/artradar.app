'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Users, CreditCard, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Label } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Artist } from '@/types'

interface Props {
  artist: Artist
}

export function ArtistAdminClient({ artist }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    name: artist.name || '',
    bio: artist.bio || '',
    nationality: artist.nationality || '',
    city: artist.city || '',
    website: artist.website || '',
    instagram: artist.instagram || '',
    open_to_collaboration: artist.open_to_collaboration,
  })

  const supabase = createClient()

  async function saveProfile() {
    setSaving(true)
    setMessage('')
    const { error } = await supabase.from('artists').update(form).eq('id', artist.id)
    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : 'Profile saved!')
    if (!error) router.refresh()
  }

  async function subscribePro() {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_type: 'artist_pro', entity_id: artist.id }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">{artist.name}</h1>
          <p className="text-ink-500 text-sm mt-0.5">Artist Dashboard</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {artist.is_verified && <Badge variant="verified"><CheckCircle size={11} /> Verified</Badge>}
          {artist.pro_subscription_active && <Badge variant="pro">PRO</Badge>}
        </div>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-2 rounded text-sm ${message.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message}
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white border border-ink-200 rounded-lg p-5 mb-6 space-y-4">
        <h2 className="font-medium text-ink-900">Edit Profile</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="nationality">Nationality</Label>
            <Input id="nationality" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
          </div>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" rows={5} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="open_collab"
            checked={form.open_to_collaboration}
            onChange={(e) => setForm({ ...form, open_to_collaboration: e.target.checked })}
            className="w-4 h-4 accent-gold-500"
          />
          <Label htmlFor="open_collab" className="mb-0 flex items-center gap-1">
            <Users size={14} className="text-green-600" />
            Open to collaboration
          </Label>
        </div>

        <Button onClick={saveProfile} disabled={saving} variant="primary">
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      {/* Pro Subscription */}
      <div className="bg-white border border-ink-200 rounded-lg p-5">
        <h2 className="font-serif text-xl text-ink-900 mb-2">Pro + Verified</h2>
        <p className="text-ink-600 text-sm mb-4">
          $5/month — Get a Verified badge on your profile, priority placement in artist listings, and access to Pro features.
        </p>
        {artist.pro_subscription_active ? (
          <div>
            <Badge variant="pro" className="mb-2"><Star size={11} /> Pro Active</Badge>
            {artist.pro_ends_at && (
              <p className="text-xs text-ink-500">Renews: {formatDate(artist.pro_ends_at)}</p>
            )}
          </div>
        ) : (
          <Button onClick={subscribePro} variant="dark">
            <CreditCard size={15} /> Subscribe — $5/month
          </Button>
        )}
      </div>
    </div>
  )
}
