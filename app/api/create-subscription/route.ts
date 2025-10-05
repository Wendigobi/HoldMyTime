// app/api/create-subscription/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

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
    // Use STRIPE_PRICE_ID from environment variables
    // This should be set to your Stripe Price ID (e.g., price_xxxxxxxxxxxxx)
    const priceId = process.env.STRIPE_PRICE_ID;
    
    if (!priceId) {
      throw new Error('STRIPE_PRICE_ID environment variable is not set. Please create a product in Stripe dashboard and add the Price ID to your environment variables.');
    }

    // Create Stripe Checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price: priceId, // Use the Price ID from Stripe dashboard
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?subscription=canceled`,
      metadata: {
        user_id: user.id,
      },
      subscription_data: {
        trial_period_days: 3,
        metadata: {
          user_id: user.id,
        },
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error: any) {
    console.error('Subscription creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
