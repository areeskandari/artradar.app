'use client'

import { useEffect, useMemo, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea, Label } from '@/components/ui/Input'

const WHATSAPP_NUMBER_E164 = '+971585413180'

function toWaMeNumber(e164: string) {
  return e164.replace(/[^\d]/g, '')
}

export function WhatsAppShortcut() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')

  const waMe = useMemo(() => toWaMeNumber(WHATSAPP_NUMBER_E164), [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  function goToWhatsApp() {
    const text = message.trim() || 'Hi! I have a question about Dubai Art Radar.'
    const url = `https://wa.me/${waMe}?text=${encodeURIComponent(text)}`
    window.location.href = url
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[60] rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl transition-shadow p-4"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={22} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-5 right-5 w-[92vw] max-w-sm bg-white border border-ink-200 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-200">
              <div>
                <p className="text-sm font-medium text-ink-900">WhatsApp</p>
                <p className="text-xs text-ink-500">{WHATSAPP_NUMBER_E164}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 text-ink-500 hover:text-ink-900"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <Label>Your message</Label>
                <Textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="primary" size="sm" onClick={goToWhatsApp} className="flex-1">
                  Send on WhatsApp
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

