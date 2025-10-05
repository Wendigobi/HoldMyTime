import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import DeleteAccountButton from '../../components/DeleteAccountButton';
import LogoutButton from '../../components/LogoutButton';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SettingsPage() {
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
            You need to be signed in to access settings.
          </p>
          <Link href="/login" className="btn inline-block">
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="container max-w-4xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fadeIn">
          <div>
            <h1 className="mb-2 text-4xl font-bold">Account Settings</h1>
            <p className="text-secondary">Manage your account and subscription</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard" className="btn-outline">
              Dashboard
            </Link>
            <LogoutButton />
          </div>
        </header>

        <div className="space-y-6">
          {/* Account Information */}
          <div className="card animate-slideUp">
            <h2 className="text-2xl font-bold text-gold mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted">Email</p>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Account Created</p>
                <p className="text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Subscription Information */}
          <div className="card animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold text-gold mb-4">Subscription</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted">Status</p>
                <p className="text-lg capitalize">
                  {userData?.subscription_status || 'No active subscription'}
                </p>
              </div>
              {userData?.subscription_status === 'trial' && userData?.trial_ends_at && (
                <div>
                  <p className="text-sm text-muted">Trial Ends</p>
                  <p className="text-lg">{new Date(userData.trial_ends_at).toLocaleDateString()}</p>
                </div>
              )}
              {userData?.subscription_status === 'active' && userData?.current_period_end && (
                <div>
                  <p className="text-sm text-muted">Next Billing Date</p>
                  <p className="text-lg">{new Date(userData.current_period_end).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border-red-900/50 animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl font-bold text-red-500 mb-4">Danger Zone</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Delete Account</h3>
                <p className="text-secondary mb-4 text-sm">
                  Permanently delete your account, all booking pages, and cancel your subscription. This action cannot be undone.
                </p>
                <DeleteAccountButton userEmail={user.email || ''} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
