'use client'

import { useMemo, useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type Msg = { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'What exhibitions are on now in DIFC?',
  'Any openings this week?',
  'Show me galleries in Alserkal Avenue.',
  'Which artists are open to collaboration?',
]

interface ArtRadarChatbotProps {
  /** When true, use taller message area (e.g. on dedicated /ask page). */
  fullPage?: boolean
}

export function ArtRadarChatbot({ fullPage }: ArtRadarChatbotProps) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Ask me about galleries, events, artists, or news in Dubai.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading])

  async function send(text: string) {
    const content = text.trim()
    if (!content) return
    setInput('')
    const next: Msg[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Chat failed')

      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer || 'No response.' }])
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry — ${e instanceof Error ? e.message : 'something went wrong'}.` },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-ink-200 rounded-xl p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-gold-600" />
        <p className="font-semibold text-ink-900">Ask Dubai Art Radar</p>
        <span className="text-[10px] font-medium uppercase tracking-wider text-ink-500 bg-ink-100 px-1.5 py-0.5 rounded">
          beta
        </span>
      </div>

      <div className="text-sm text-ink-600 mb-4">
        Try: events by area/date, gallery directory questions, or quick recommendations.
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => void send(s)}
            className="text-xs px-3 py-1.5 rounded-full border border-ink-200 bg-ink-50 text-ink-700 hover:border-ink-300 hover:bg-ink-100 transition-colors"
            disabled={loading}
          >
            {s}
          </button>
        ))}
      </div>

      <div
        className={`overflow-auto space-y-3 pr-1 ${fullPage ? 'min-h-[320px] max-h-[50vh]' : 'max-h-56'}`}
      >
        {messages.map((m, idx) => (
          <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div
              className={[
                'inline-block max-w-[92%] rounded-lg px-3 py-2 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'bg-gold-100 text-ink-900 border border-gold-200'
                  : 'bg-ink-50 border border-ink-200 text-ink-900',
              ].join(' ')}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <form
        className="mt-4 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          void send(input)
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about galleries, events, artists..."
          className="bg-white border-ink-300 text-ink-900 placeholder:text-ink-400"
        />
        <Button type="submit" variant="gold" size="md" disabled={!canSend}>
          <Send size={16} />
        </Button>
      </form>
    </div>
  )
}
