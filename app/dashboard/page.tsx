// app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import { SITE_URL } from '../../lib/constants';
import type { Business } from '../../lib/types';
import DeleteBusinessButton from '../../components/DeleteBusinessButton';
import LogoutButton from '../../components/LogoutButton';
import SubscriptionButton from '../../components/SubscriptionButton';
import ConnectStripeButton from '../../components/ConnectStripeButton';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Dashboard() {
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <main className="centered-layout">
        <div className="card max-w-md text-center">
          <h2 className="mb-4 text-2xl font-bold text-gold">Authentication Required</h2>
          <p className="mb-6 text-secondary">
            You need to be signed in to access your dashboard.
          </p>
          <Link href="/login" className="btn inline-block">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  // Check if user has active subscription or trial
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const hasActiveAccess = userData?.subscription_status === 'active' || userData?.subscription_status === 'trial';
  const isTrialing = userData?.subscription_status === 'trial';

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="container max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fadeIn">
          <div>
            <h1 className="mb-2 text-4xl font-bold">Dashboard</h1>
            <p className="text-secondary">Manage your booking pages</p>
            {isTrialing && userData?.trial_ends_at && (
              <p className="text-sm text-gold mt-1">
                Free trial ends {new Date(userData.trial_ends_at).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Link href="/" className="btn-outline inline-block">
              + Create New Page
            </Link>
            <Link href="/settings" className="btn-outline inline-block">
              Settings
            </Link>
            <LogoutButton />
          </div>
        </header>

        {!hasActiveAccess && (
          <div className="mb-8 card-gold animate-fadeIn">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-gold">Start Your 3-Day Free Trial</h2>
              <p className="text-secondary mb-6">
                Get unlimited booking pages and secure deposit collection for only $15/month. No credit card required for trial.
              </p>
              <SubscriptionButton />
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border-2 border-red-600 bg-red-950/30 p-4">
            <p className="text-red-400">{error.message}</p>
          </div>
        )}

        {!businesses?.length ? (
          <div className="card-gold text-center">
            <svg className="mx-auto mb-4 h-16 w-16 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="mb-2 text-2xl font-bold text-gold">No Booking Pages Yet</h2>
            <p className="mb-6 text-secondary">
              Create your first booking page to start accepting appointments with deposits.
            </p>
            <Link href="/" className="btn inline-block">
              Create First Page
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {businesses.map((b: Business, idx: number) => (
              <div key={b.id} className="card group animate-slideUp" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-bold text-gold">{b.business_name}</h3>
                    <div className="space-y-1 text-sm text-secondary">
                      <p>
                        <span className="text-muted">Deposit:</span> ${(b.deposit_cents / 100).toFixed(0)}
                      </p>
                      <p>
                        <span className="text-muted">Email:</span> {b.contact_email}
                      </p>
                      {b.phone && (
                        <p>
                          <span className="text-muted">Phone:</span> {b.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/business/${b.slug}`} className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                      View Page
                    </Link>
                    <DeleteBusinessButton businessId={b.id} businessName={b.business_name} />
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-black/50 p-3">
                  <p className="text-xs text-muted">Public URL:</p>
                  <a
                    href={`${SITE_URL}/business/${b.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm text-gold hover:text-gold-light"
                  >
                    {SITE_URL}/business/{b.slug}
                  </a>
                </div>

                <div className="mt-4">
                  <ConnectStripeButton
                    businessId={b.id}
                    stripeAccountId={b.stripe_account_id}
                    stripeAccountStatus={b.stripe_account_status}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
