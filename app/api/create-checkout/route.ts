// app/api/create-checkout/route.ts
import { NextResponse } from 'next/server';
import getSupabaseAdmin from '../../../lib/supabaseAdmin';
import stripe from '../../../lib/stripe';

export const runtime = 'nodejs';

// Map the dropdown / text values to cents
const TIER_TO_CENTS: Record<string, number> = {
  '25': 2500, '$25': 2500,
  '50': 5000, '$50': 5000,
  '75': 7500, '$75': 7500,
  '100': 10000, '$100': 10000,
};

function toCents(v: FormDataEntryValue | string | null | undefined): number {
  if (!v) return 2500;
  const s = String(v).trim();
  if (s in TIER_TO_CENTS) return TIER_TO_CENTS[s];
  const num = parseInt(s.replace('$', ''), 10);
  return Number.isFinite(num) ? num * 100 : 2500;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let payload: any = {};

    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else {
      // accept form-encoded or multipart
      const fd = await req.formData();
      payload = Object.fromEntries(fd.entries());
    }

    const {
      owner_email,
      business_name,
      industry,
      phone,
      contact_email,
      price_tier, // e.g. "$25" or "25"
    } = payload;

    const deposit_cents = toCents(price_tier);

    // (optional) persist a “pending” business row so you can reconcile on webhook
    const supabase = getSupabaseAdmin();
    const { data: inserted, error: insertErr } = await supabase
      .from('businesses')
      .insert([
        {
          owner_email,
          business_name,
          industry,
          phone,
          contact_email,
          deposit_cents,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 400 });
    }

    // Create Stripe Checkout Session
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get('origin') ||
      'https://www.holdmytime.io';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Deposit for ${business_name || 'booking'}`,
            },
            unit_amount: deposit_cents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        business_id: String(inserted.id ?? ''),
        owner_email: String(owner_email ?? ''),
        business_name: String(business_name ?? ''),
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=1`,
    });

    return NextResponse.json({ ok: true, url: session.url }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? 'Unexpected error' }, { status: 500 });
  }
}
