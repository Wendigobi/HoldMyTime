// app/login/page.tsx
'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function Login() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // IMPORTANT: This should be your production domain
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.holdmytime.io'}/auth/callback`
        }
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to send login link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-md rounded-xl border border-amber-500/20 bg-black/40 p-6">
        <h1 className="mb-6 text-3xl font-semibold text-amber-300">Sign in</h1>

        {sent ? (
          <p className="text-amber-200">Check your email for a login link.</p>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-amber-500/30 bg-black/60 px-3 py-2 text-amber-50 placeholder-amber-400/50 outline-none"
            />
            {err && <p className="text-sm text-red-400">{err}</p>}
            <button
              disabled={loading}
              className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-black hover:bg-amber-400 disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Email me a sign-in link'}
            </button>
          </form>
        )}

        <div className="mt-6 text-sm text-amber-200/80">
          <Link href="/" className="hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
