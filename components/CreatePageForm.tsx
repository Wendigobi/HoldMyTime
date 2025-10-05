// components/CreatePageForm.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { DEPOSIT_TIERS, SITE_URL } from '../lib/constants';
import type { DepositTier } from '../lib/types';

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export default function CreatePageForm() {
  const router = useRouter();
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const [businessName, setBusinessName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deposit, setDeposit] = useState<DepositTier>(50);
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    setSlug(slugify(businessName));
  }, [businessName]);

  useEffect(() => {
    async function checkSubscription() {
      try {
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        const user = userRes.user;
        if (!user) {
          setHasActiveSubscription(false);
          setCheckingSubscription(false);
          return;
        }

        // Check user's subscription status
        const { data: userData, error: dbErr } = await supabase
          .from('users')
          .select('subscription_status')
          .eq('id', user.id)
          .single();

        if (dbErr) {
          console.error('Error checking subscription:', dbErr);
          setHasActiveSubscription(false);
        } else {
          const hasAccess = userData?.subscription_status === 'active' || userData?.subscription_status === 'trial';
          setHasActiveSubscription(hasAccess);
        }
      } catch (e) {
        console.error('Error checking subscription:', e);
        setHasActiveSubscription(false);
      } finally {
        setCheckingSubscription(false);
      }
    }

    checkSubscription();
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);

    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes.user;
      if (!user) {
        setErr('Please sign in first.');
        setSaving(false);
        return;
      }

      // Check subscription status before creating page
      if (!hasActiveSubscription) {
        setErr('You need an active subscription to create a booking page. Please subscribe to continue.');
        setSaving(false);
        return;
      }

      // Try to insert record
      const insert = {
        owner_id: user.id,
        business_name: businessName,
        slug,
        contact_email: contactEmail,
        phone,
        deposit_cents: deposit * 100,
      };

      const { error: dbErr } = await supabase.from('businesses').insert(insert);
      if (dbErr) {
        // If slug collision, retry with suffix
        if (dbErr.code === '23505') {
          const alt = `${slug}-${(Math.random() * 1000) | 0}`;
          const { error: dbErr2 } = await supabase.from('businesses').insert({
            ...insert,
            slug: alt,
          });
          if (dbErr2) throw dbErr2;
        } else {
          throw dbErr;
        }
      }

      router.push('/dashboard');
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? 'Could not create booking page.');
    } finally {
      setSaving(false);
    }
  }

  // Show loading state while checking subscription
  if (checkingSubscription) {
    return (
      <div className="card-gold max-w-3xl mx-auto">
        <div className="text-center py-8">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-secondary">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // Show subscription required message if no active subscription
  if (!hasActiveSubscription) {
    return (
      <div className="card-gold max-w-3xl mx-auto">
        <h3 className="mb-6 text-2xl font-bold text-gold">Subscription Required</h3>
        <p className="mb-6 text-secondary">
          You need an active subscription to create booking pages. Start your 3-day free trial to get started!
        </p>
        <div className="flex gap-4">
          <a href="/dashboard" className="btn">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="card-gold max-w-3xl mx-auto">
      <h3 className="mb-6 text-2xl font-bold text-gold">Create Booking Page</h3>
      <p className="mb-6 text-secondary">Set up your professional booking page in minutes</p>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-secondary">Business Name</label>
          <input
            className="field"
            placeholder="e.g., Jackson Heating & Air"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-secondary">Contact Email</label>
            <input
              type="email"
              className="field"
              placeholder="owner@business.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-secondary">Phone (Optional)</label>
            <input
              type="tel"
              className="field"
              placeholder="(555) 555-5555"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-secondary">Deposit Amount</label>
            <div className="flex flex-wrap gap-2">
              {DEPOSIT_TIERS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDeposit(d)}
                  className={
                    deposit === d
                      ? 'btn'
                      : 'btn-outline'
                  }
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                >
                  ${d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-secondary">Custom URL</label>
            <input
              className="field"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              required
            />
            <p className="mt-2 text-xs text-muted">
              Your booking page: <span className="text-gold">{SITE_URL}/business/{slug || 'your-url'}</span>
            </p>
          </div>
        </div>

        {err && (
          <div className="rounded-lg border-2 border-red-600 bg-red-950/30 p-3">
            <p className="text-sm text-red-400">{err}</p>
          </div>
        )}

        <div className="flex items-center gap-4 pt-4">
          <button
            disabled={saving}
            className="btn"
          >
            {saving ? 'Creating…' : 'Create Booking Page'}
          </button>
        </div>
      </form>
    </div>
  );
}
