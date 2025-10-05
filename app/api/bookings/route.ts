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
      notes,
      amount_to_pay, // cents - what customer chose to pay (deposit to full price)
      tip_amount, // cents - optional tip
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

    // Calculate deposit and service price
    let depositAmountCents: number;
    let servicePriceCents: number;

    if (business.service_price_cents) {
      servicePriceCents = business.service_price_cents;
    } else {
      // Fallback: use deposit as service price for backwards compatibility
      servicePriceCents = business.deposit_cents;
    }

    if (business.deposit_type === 'percentage' && business.deposit_percentage && business.service_price_cents) {
      depositAmountCents = Math.round(business.service_price_cents * (business.deposit_percentage / 100));
    } else {
      depositAmountCents = business.deposit_cents;
    }

    // Use amount_to_pay from customer if provided, otherwise use deposit
    const paymentAmountCents = amount_to_pay || depositAmountCents;
    const tipAmountCents = tip_amount || 0;

    // Validate payment amount
    if (paymentAmountCents < depositAmountCents) {
      return NextResponse.json(
        { error: `Payment amount must be at least $${(depositAmountCents / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    if (paymentAmountCents > servicePriceCents) {
      return NextResponse.json(
        { error: `Payment amount cannot exceed service price of $${(servicePriceCents / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    const balanceRemaining = servicePriceCents - paymentAmountCents;

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
        service_price_cents: servicePriceCents,
        deposit_amount_cents: depositAmountCents,
        amount_paid_cents: paymentAmountCents,
        tip_cents: tipAmountCents,
        balance_remaining_cents: balanceRemaining,
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

    // Total amount customer pays (service payment + tip)
    const totalChargeCents = paymentAmountCents + tipAmountCents;

    // Platform fee is only on service payment, NOT on tips
    // Tip goes 100% to business
    const platformFeeCents = PLATFORM_FEE_CENTS;

    // Build line items
    const lineItems: any[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${business.service_name || 'Service'} - ${business.business_name}`,
            description: `${service || 'Service'} on ${date || 'TBD'} at ${time || 'TBD'}`,
          },
          unit_amount: paymentAmountCents,
        },
        quantity: 1,
      },
    ];

    // Add tip as separate line item if present
    if (tipAmountCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tip',
            description: 'Gratuity for service provider',
          },
          unit_amount: tipAmountCents,
        },
        quantity: 1,
      });
    }

    const sessionConfig = {
      payment_method_types: ['card'] as any,
      line_items: lineItems,
      mode: 'payment' as const,
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${siteUrl}/canceled?booking_id=${booking.id}`,
      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        metadata: {
          booking_id: booking.id,
          business_id: business_id,
          platform_fee_cents: platformFeeCents.toString(),
          service_payment_cents: paymentAmountCents.toString(),
          tip_cents: tipAmountCents.toString(),
          balance_remaining_cents: balanceRemaining.toString(),
        },
      },
      metadata: {
        booking_id: booking.id,
        business_id: business_id,
        platform_fee_cents: platformFeeCents.toString(),
        service_payment_cents: paymentAmountCents.toString(),
        tip_cents: tipAmountCents.toString(),
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
