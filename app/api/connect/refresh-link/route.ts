// app/api/connect/refresh-link/route.ts
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

    // Get business with stripe account
    const { data: business, error: bizErr } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .eq('owner_id', user.id)
      .single();

    if (bizErr || !business || !business.stripe_account_id) {
      return NextResponse.json({ error: 'Business or Stripe account not found' }, { status: 404 });
    }

    // Create new account link for existing account
    const accountLink = await stripe.accountLinks.create({
      account: business.stripe_account_id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?connect_refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?connect_complete=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ 
      onboardingUrl: accountLink.url 
    });
  } catch (error: any) {
    console.error('Refresh link error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
