// app/api/stripe-webhook/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic' // <-- prevents pre-render

// If you pinned apiVersion earlier, remove it or keep it pinned to your installed SDK version.
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig || !secret) {
    return NextResponse.json({ error: 'Missing webhook signature/secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const payload = await req.text()
    event = stripe.webhooks.constructEvent(payload, sig, secret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const stripeSessionId = session.id
      const email = session.customer_details?.email || null
      const amountTotal = session.amount_total || 0

      // Example: mark booking as paid by stripeSessionId
      const supabase = getSupabaseAdmin()
      const { error } = await supabase
        .from('bookings')
        .update({ paid: true, stripe_session_id: stripeSessionId, email, amount_total: amountTotal })
        .eq('stripe_session_id', stripeSessionId)

      if (error) throw error
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 })
  }
}
