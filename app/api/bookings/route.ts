// app/api/bookings/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import getSupabaseAdmin from '../../../lib/supabaseAdmin';
import { PLATFORM_FEE_CENTS } from '../../../lib/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {}
        }
      }
    );

    // Require authentication
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Get businesses owned by this user
    const adminSupabase = getSupabaseAdmin();
    const { data: businesses, error: bizErr } = await adminSupabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id);

    if (bizErr || !businesses) {
      return NextResponse.json({ ok: false, error: 'Failed to fetch businesses' }, { status: 500 });
    }

    const businessIds = businesses.map(b => b.id);

    // Get bookings for those businesses
    const { data, error } = await adminSupabase
      .from('bookings')
      .select('*')
      .in('business_id', businessIds)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message ?? 'Unexpected error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      business_id,
      customer_name,
      customer_email,
      customer_phone,
      service,
      address,
      date,
      time,
      notes
    } = body;

    if (!business_id || !customer_name || !customer_email) {
      return NextResponse.json(
        { error: 'Missing required fields: business_id, customer_name, customer_email' },
        { status: 400 }
      );
    }

    // Get business details
    const supabase = getSupabaseAdmin();
    const { data: business, error: bizErr } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', business_id)
      .single();

    if (bizErr || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Check if business has Stripe Connect account set up
    if (!business.stripe_account_id) {
      return NextResponse.json(
        { error: 'This business has not set up payment processing yet. Please contact the business owner.' },
        { status: 400 }
      );
    }

    // Check if Stripe Connect account is active
    if (business.stripe_account_status !== 'active') {
      return NextResponse.json(
        { error: 'This business is not yet able to accept payments. Please contact the business owner.' },
        { status: 400 }
      );
    }

    // Create booking record
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({
        business_id,
        customer_name,
        customer_email,
        customer_phone: customer_phone || null,
        service: service || null,
        customer_address: address || null,
        booking_date: date || null,
        booking_time: time || null,
        notes: notes || null,
        deposit_paid: false,
        deposit_amount_cents: business.deposit_cents,
        status: 'pending'
      })
      .select()
      .single();

    if (bookingErr) {
      return NextResponse.json({ error: bookingErr.message }, { status: 500 });
    }

    // Create Stripe checkout session with Connect account
    const stripe = (await import('../../../lib/stripe')).default;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.holdmytime.io';

    const sessionConfig = {
      payment_method_types: ['card'] as any,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Booking Deposit - ${business.business_name}`,
              description: `${service || 'Service'} on ${date || 'TBD'} at ${time || 'TBD'}`,
            },
            unit_amount: business.deposit_cents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment' as const,
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${siteUrl}/canceled?booking_id=${booking.id}`,
      payment_intent_data: {
        application_fee_amount: PLATFORM_FEE_CENTS,
        metadata: {
          booking_id: booking.id,
          business_id: business_id,
          platform_fee_cents: PLATFORM_FEE_CENTS.toString(),
        },
      },
      metadata: {
        booking_id: booking.id,
        business_id: business_id,
        platform_fee_cents: PLATFORM_FEE_CENTS.toString(),
      },
    };

    const session = await stripe.checkout.sessions.create(
      sessionConfig,
      { stripeAccount: business.stripe_account_id }
    );

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err: any) {
    console.error('Booking creation error:', err);
    return NextResponse.json({ error: err.message ?? 'Unexpected error' }, { status: 500 });
  }
}
