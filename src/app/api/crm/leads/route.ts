import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const full_name = String(body.full_name || '').trim()
    const phone = String(body.phone || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const source = String(body.source || 'keep-on-your-radar').trim() || 'keep-on-your-radar'

    if (!full_name || !phone || !email) {
      return NextResponse.json({ error: 'Full name, phone, and email are required' }, { status: 400 })
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email' }, { status: 400 })
    }
    if (phone.replace(/\D/g, '').length < 7) {
      return NextResponse.json({ error: 'Enter a valid phone number' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { error } = await supabase.from('crm_leads').insert({ full_name, phone, email, source })

    if (error) {
      console.error('CRM lead error:', error)
      const missing = error.message.toLowerCase().includes('crm_leads')
      return NextResponse.json(
        {
          error: missing
            ? 'CRM is not set up yet. Run supabase/crm-leads.sql in the Supabase SQL editor.'
            : 'Could not save your details. Try again.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('CRM lead error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
