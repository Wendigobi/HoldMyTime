import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
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
        set() {},
        remove() {}
      }
    }
  );

  // Check authentication
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Get user data to check for subscription
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_id, stripe_customer_id')
      .eq('id', user.id)
      .single();

    // Cancel Stripe subscription if exists
    if (userData?.subscription_id) {
      try {
        await stripe.subscriptions.cancel(userData.subscription_id);
      } catch (stripeErr: any) {
        console.error('Error canceling subscription:', stripeErr);
        // Continue with deletion even if subscription cancel fails
      }
    }

    // Delete all bookings for user's businesses
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id);

    if (businesses && businesses.length > 0) {
      const businessIds = businesses.map(b => b.id);
      await supabase
        .from('bookings')
        .delete()
        .in('business_id', businessIds);
    }

    // Delete all businesses
    await supabase
      .from('businesses')
      .delete()
      .eq('owner_id', user.id);

    // Delete user record from users table
    await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    // Delete auth user (this will cascade delete via trigger)
    const { error: deleteAuthErr } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteAuthErr) {
      console.error('Error deleting auth user:', deleteAuthErr);
      // If admin deletion fails, sign out the user
      await supabase.auth.signOut();
    }

    return NextResponse.json({
      ok: true,
      message: 'Account deleted successfully'
    });
  } catch (err: any) {
    console.error('Error deleting account:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
