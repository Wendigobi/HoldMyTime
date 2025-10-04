// app/api/stripe-webhook/route.ts
import { NextResponse } from 'next/server';
import getSupabaseAdmin from '../../../lib/supabaseAdmin';
import stripe from '../../../lib/stripe';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') || '';
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json({ ok: false, error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
  }

  try {
    const body = await req.text(); // raw body for Stripe
    const event = stripe.webhooks.constructEvent(body, sig, secret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const businessId = session?.metadata?.business_id;

      if (businessId) {
        const supabase = getSupabaseAdmin();
        await supabase
          .from('businesses')
          .update({ status: 'paid', checkout_session_id: session.id })
          .eq('id', businessId);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: `Webhook Error: ${err.message ?? 'Unknown error'}` },
      { status: 400 },
    );
  }
}
