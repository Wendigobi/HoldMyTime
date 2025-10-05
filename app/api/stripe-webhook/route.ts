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

    const supabase = getSupabaseAdmin();

    // Handle checkout completion for bookings/deposits
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const businessId = session?.metadata?.business_id;
      const platformFeeCents = parseInt(session?.metadata?.platform_fee_cents || '0', 10);

      if (businessId) {
        await supabase
          .from('businesses')
          .update({ status: 'paid', checkout_session_id: session.id })
          .eq('id', businessId);

        // If there's a booking associated, update it with platform fee
        if (session.metadata?.booking_id && platformFeeCents > 0) {
          await supabase
            .from('bookings')
            .update({ platform_fee_cents: platformFeeCents })
            .eq('id', session.metadata.booking_id);
        }
      }
    }

    // Handle Stripe Connect account updates
    if (event.type === 'account.updated') {
      const account = event.data.object as any;
      const accountId = account.id;

      // Find the business with this Stripe account ID
      const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('stripe_account_id', accountId)
        .single();

      if (business) {
        // Determine account status
        let accountStatus: string = 'pending';
        if (account.charges_enabled && account.payouts_enabled) {
          accountStatus = 'active';
        } else if (account.requirements?.disabled_reason) {
          accountStatus = 'restricted';
        }

        // Update business with latest Stripe account info
        await supabase
          .from('businesses')
          .update({
            stripe_account_status: accountStatus,
            stripe_onboarding_complete: account.details_submitted || false,
            stripe_charges_enabled: account.charges_enabled || false,
            stripe_payouts_enabled: account.payouts_enabled || false,
          })
          .eq('stripe_account_id', accountId);
      }
    }

    // Handle subscription events (if using Stripe for subscriptions)
    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any;
      const customerId = subscription.customer;

      // Update user subscription status
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('stripe_customer_id', customerId)
        .single();

      if (user) {
        const status = subscription.status === 'active' ? 'active' :
                      subscription.status === 'trialing' ? 'trial' :
                      subscription.status === 'past_due' ? 'past_due' : 'canceled';

        await supabase
          .from('users')
          .update({
            subscription_status: status,
            subscription_id: subscription.id,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_customer_id', customerId);
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
