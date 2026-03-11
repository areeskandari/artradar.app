import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as { metadata?: Record<string, string>; customer?: string }
        const { product_type, entity_id } = session.metadata || {}

        if (product_type === 'gallery_subscription' && entity_id) {
          await supabase.from('galleries').update({
            subscription_active: true,
            subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            stripe_customer_id: String(session.customer),
          }).eq('id', entity_id)
        }

        if (product_type === 'feature_event' && entity_id) {
          await supabase.from('events').update({ is_featured: true }).eq('id', entity_id)
        }

        if (product_type === 'artist_pro' && entity_id) {
          await supabase.from('artists').update({
            pro_subscription_active: true,
            is_verified: true,
            pro_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            stripe_customer_id: String(session.customer),
          }).eq('id', entity_id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as { customer?: string; metadata?: Record<string, string> }
        const customerId = String(subscription.customer)

        // Deactivate gallery subscription
        await supabase.from('galleries').update({
          subscription_active: false,
          subscription_ends_at: null,
        }).eq('stripe_customer_id', customerId)

        // Deactivate artist pro
        await supabase.from('artists').update({
          pro_subscription_active: false,
          is_verified: false,
          pro_ends_at: null,
        }).eq('stripe_customer_id', customerId)
        break
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
