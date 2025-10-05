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
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [depositType, setDepositType] = useState<'percentage' | 'fixed'>('percentage');
  const [depositPercentage, setDepositPercentage] = useState(50);
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

      // Calculate deposit amount based on type
      let depositCents: number;
      let servicePriceCents: number | null = null;

      if (depositType === 'percentage') {
        // Must have service price for percentage
        if (!servicePrice || parseFloat(servicePrice) <= 0) {
          setErr('Service price is required when using percentage deposit.');
          setSaving(false);
          return;
        }
        servicePriceCents = Math.round(parseFloat(servicePrice) * 100);
        depositCents = Math.round(servicePriceCents * (depositPercentage / 100));
      } else {
        // Fixed deposit
        depositCents = deposit * 100;
        // Service price is optional for fixed deposit
        if (servicePrice && parseFloat(servicePrice) > 0) {
          servicePriceCents = Math.round(parseFloat(servicePrice) * 100);
        }
      }

      // Try to insert record
      const insert: any = {
        owner_id: user.id,
        business_name: businessName,
        slug,
        contact_email: contactEmail,
        phone,
        service_name: serviceName || null,
        service_price_cents: servicePriceCents,
        deposit_type: depositType,
        deposit_percentage: depositType === 'percentage' ? depositPercentage : null,
        deposit_cents: depositCents,
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

        {/* Service Details */}
        <div className="border-t border-gold/30 pt-6">
          <h4 className="text-lg font-semibold text-gold mb-4">Service Details</h4>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-secondary">
                Service Name <span className="text-xs text-muted">(Optional)</span>
              </label>
              <input
                className="field"
                placeholder="e.g., Men's Haircut"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-secondary">
                Service Price {depositType === 'percentage' && <span className="text-red-400">*</span>}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="field pl-8"
                  placeholder="80.00"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  required={depositType === 'percentage'}
                />
              </div>
              <p className="mt-1 text-xs text-muted">Total cost of your service</p>
            </div>
          </div>
        </div>

        {/* Deposit Configuration */}
        <div className="border-t border-gold/30 pt-6">
          <h4 className="text-lg font-semibold text-gold mb-4">Deposit Requirement</h4>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-secondary">Deposit Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="depositType"
                  value="percentage"
                  checked={depositType === 'percentage'}
                  onChange={(e) => setDepositType(e.target.value as 'percentage')}
                  className="w-4 h-4 text-gold"
                />
                <span className="text-secondary">Percentage of service price</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="depositType"
                  value="fixed"
                  checked={depositType === 'fixed'}
                  onChange={(e) => setDepositType(e.target.value as 'fixed')}
                  className="w-4 h-4 text-gold"
                />
                <span className="text-secondary">Fixed amount</span>
              </label>
            </div>
          </div>

          {depositType === 'percentage' ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-secondary">Deposit Percentage</label>
              <div className="flex flex-wrap gap-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDepositPercentage(pct)}
                    className={depositPercentage === pct ? 'btn' : 'btn-outline'}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    {pct}%
                    {servicePrice && parseFloat(servicePrice) > 0 && (
                      <span className="ml-1 text-xs">
                        (${(parseFloat(servicePrice) * (pct / 100)).toFixed(0)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {servicePrice && parseFloat(servicePrice) > 0 && (
                <p className="mt-2 text-sm text-gold">
                  Required deposit: ${(parseFloat(servicePrice) * (depositPercentage / 100)).toFixed(2)}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-medium text-secondary">Deposit Amount</label>
              <div className="flex flex-wrap gap-2">
                {DEPOSIT_TIERS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDeposit(d)}
                    className={deposit === d ? 'btn' : 'btn-outline'}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    ${d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* URL Configuration */}
        <div className="border-t border-gold/30 pt-6">
          <h4 className="text-lg font-semibold text-gold mb-4">Booking Page URL</h4>
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
