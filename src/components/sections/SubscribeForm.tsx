'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface SubscribeFormProps {
  sourceType?: 'gallery' | 'event' | 'artist' | 'newsletter'
  sourceId?: string
  title?: string
  description?: string
  variant?: 'light' | 'dark'
}

export function SubscribeForm({
  sourceType = 'newsletter',
  sourceId,
  title = 'Stay in the Loop',
  description = 'Get updates on new exhibitions, events, and art news delivered to your inbox.',
  variant = 'light',
}: SubscribeFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, source_type: sourceType, source_id: sourceId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to subscribe')
      }

      setSuccess(true)
      setName('')
      setEmail('')
      setPhone('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const isDark = variant === 'dark'

  if (success) {
    return (
      <div className={`rounded-lg p-6 text-center ${isDark ? 'bg-ink-900 text-cream' : 'bg-gold-50 text-ink-900'}`}>
        <p className="font-serif text-xl mb-2">You&rsquo;re subscribed.</p>
        <p className={`text-sm ${isDark ? 'text-ink-400' : 'text-ink-600'}`}>
          We&rsquo;ll be in touch with the best of Dubai&rsquo;s art scene.
        </p>
      </div>
    )
  }

  return (
    <div className={`rounded-lg p-6 ${isDark ? 'bg-ink-900 border border-ink-700' : 'bg-gold-50 border border-gold-200'}`}>
      <h3 className={`font-serif text-xl mb-1 ${isDark ? 'text-white' : 'text-ink-900'}`}>{title}</h3>
      <p className={`text-sm mb-4 ${isDark ? 'text-ink-400' : 'text-ink-600'}`}>{description}</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={isDark ? 'bg-ink-800 border-ink-600 text-cream placeholder:text-ink-500' : ''}
        />
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={isDark ? 'bg-ink-800 border-ink-600 text-cream placeholder:text-ink-500' : ''}
        />
        <Input
          type="tel"
          placeholder="Phone number (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={isDark ? 'bg-ink-800 border-ink-600 text-cream placeholder:text-ink-500' : ''}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button
          type="submit"
          variant={isDark ? 'gold' : 'primary'}
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
    </div>
  )
}
