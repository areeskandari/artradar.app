'use client'

import { FormEvent, useEffect, useState } from 'react'
import { KEEP_ON_YOUR_RADAR as EVENT } from '@/lib/keep-on-your-radar'
import { radarDisplayClass } from '@/components/events/RadarEventIdentity'

const STORAGE_KEY = 'artradar.crm.keep-on-your-radar'

export function RadarCrmGate() {
  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === '1') return
    } catch {
      // still show the form
    }
    setOpen(true)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          email,
          source: EVENT.slug,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Could not submit. Try again.')
        return
      }
      try {
        window.localStorage.setItem(STORAGE_KEY, '1')
      } catch {
        // ignore
      }
      setOpen(false)
      document.body.style.overflow = ''
    } catch {
      setError('Could not submit. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#3a271c]/35 backdrop-blur-md" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="radar-crm-title"
        className="relative z-10 w-full max-w-md rounded-lg border border-[#fa6628]/25 bg-[#fff7f0] p-5 sm:p-6 shadow-xl"
      >
        <p className="type-eyebrow !text-[#fa6628] mb-2">{EVENT.tagline}</p>
        <h2
          id="radar-crm-title"
          className={`${radarDisplayClass()} text-2xl font-semibold tracking-[-0.03em] text-[#fa6628] mb-2`}
        >
          Join the walk
        </h2>
        <p className="text-sm leading-relaxed text-[#5a4030] mb-5">
          Leave your name, phone, and email to get event updates.
        </p>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#5a4030]">Full name</span>
            <input
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-md border border-[#fa6628]/30 bg-white px-3 py-2.5 text-sm text-[#3a271c] outline-none focus:ring-2 focus:ring-[#fa6628]/40"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#5a4030]">Phone</span>
            <input
              required
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-[#fa6628]/30 bg-white px-3 py-2.5 text-sm text-[#3a271c] outline-none focus:ring-2 focus:ring-[#fa6628]/40"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-[#5a4030]">Email</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[#fa6628]/30 bg-white px-3 py-2.5 text-sm text-[#3a271c] outline-none focus:ring-2 focus:ring-[#fa6628]/40"
            />
          </label>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#fa6628] px-5 py-2.5 text-sm font-semibold text-[#fff7f0] transition-colors hover:bg-[#e24e14] disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  )
}
