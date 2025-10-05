// app/api/connect/create-account/route.ts
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

    // Verify business belongs to user
    const { data: business, error: bizErr } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .eq('owner_id', user.id)
      .single();

    if (bizErr || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Check if already has Stripe account
    if (business.stripe_account_id) {
      return NextResponse.json({ 
        error: 'Stripe account already exists',
        accountId: business.stripe_account_id 
      }, { status: 400 });
    }

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email: business.contact_email || user.email,
      business_type: 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        business_id: businessId,
        owner_id: user.id,
      },
    });

    // Save account ID to database
    const { error: updateErr } = await supabase
      .from('businesses')
      .update({
        stripe_account_id: account.id,
        stripe_account_status: 'pending',
      })
      .eq('id', businessId);

    if (updateErr) {
      console.error('Error saving Stripe account ID:', updateErr);
      return NextResponse.json({ error: 'Failed to save account' }, { status: 500 });
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?connect_refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?connect_complete=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ 
      accountId: account.id,
      onboardingUrl: accountLink.url 
    });
  } catch (error: any) {
    console.error('Connect account creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
