// app/api/connect/check-status/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { businessId } = await req.json();

    // Get business
    const { data: business, error: bizErr } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .eq('owner_id', user.id)
      .single();

    if (bizErr || !business || !business.stripe_account_id) {
      return NextResponse.json({ error: 'Business or Stripe account not found' }, { status: 404 });
    }

    // Fetch account from Stripe
    const account = await stripe.accounts.retrieve(business.stripe_account_id);

    // Determine account status
    let accountStatus: string = 'pending';
    if (account.charges_enabled && account.payouts_enabled) {
      accountStatus = 'active';
    } else if (account.requirements?.disabled_reason) {
      accountStatus = 'restricted';
    }

    // Update business with latest info
    const { error: updateErr } = await supabase
      .from('businesses')
      .update({
        stripe_account_status: accountStatus,
        stripe_onboarding_complete: account.details_submitted || false,
        stripe_charges_enabled: account.charges_enabled || false,
        stripe_payouts_enabled: account.payouts_enabled || false,
      })
      .eq('id', businessId);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    return NextResponse.json({ 
      status: accountStatus,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted
    });
  } catch (error: any) {
    console.error('Check status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
