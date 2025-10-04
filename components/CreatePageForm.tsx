// components/CreatePageForm.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

const DEPOSITS = [25, 50, 75, 100];

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
  const [deposit, setDeposit] = useState<number>(50);
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setSlug(slugify(businessName));
  }, [businessName]);

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

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-black/40 p-6 shadow-[0_8px_40px_rgba(255,200,0,0.08)] backdrop-blur">
      <h3 className="mb-4 text-xl font-semibold text-amber-300">Create booking page</h3>
      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="mb-1 block text-sm text-amber-200/90">Business name</label>
          <input
            className="w-full rounded-xl border border-amber-500/30 bg-black/60 px-3 py-2 text-amber-50 outline-none placeholder-amber-400/50"
            placeholder="e.g., Jackson Heating & Air"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-amber-200/90">Contact email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-amber-500/30 bg-black/60 px-3 py-2 text-amber-50 outline-none placeholder-amber-400/50"
              placeholder="owner@business.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-amber-200/90">Phone</label>
            <input
              className="w-full rounded-xl border border-amber-500/30 bg-black/60 px-3 py-2 text-amber-50 outline-none placeholder-amber-400/50"
              placeholder="(555) 555-5555"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-amber-200/90">Deposit</label>
            <div className="flex flex-wrap gap-2">
              {DEPOSITS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDeposit(d)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm transition',
                    deposit === d
                      ? 'border-amber-400 bg-amber-500 text-black'
                      : 'border-amber-500/30 bg-black/60 text-amber-200 hover:border-amber-400/70',
                  ].join(' ')}
                >
                  ${d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-amber-200/90">Page URL slug</label>
            <input
              className="w-full rounded-xl border border-amber-500/30 bg-black/60 px-3 py-2 text-amber-50 outline-none placeholder-amber-400/50"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              required
            />
            <p className="mt-1 text-xs text-amber-300/70">
              Your public page: {process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.holdmytime.io'}/business/{slug || '<slug>'}
            </p>
          </div>
        </div>

        {err && <p className="text-sm text-red-400">{err}</p>}

        <div className="flex items-center gap-3">
          <button
            disabled={saving}
            className="rounded-xl bg-amber-500 px-4 py-2 font-medium text-black hover:bg-amber-400 disabled:opacity-60"
          >
            {saving ? 'Creating…' : 'Create booking page'}
          </button>
        </div>
      </form>
    </div>
  );
}
