'use client';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Login() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const redirectTo =
      (typeof window !== 'undefined' && `${window.location.origin}/auth/callback`) ||
      process.env.NEXT_PUBLIC_SITE_URL + '/auth/callback';

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <main className="max-w-md mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-semibold mb-6">Sign in</h1>
      {sent ? (
        <p>Check your email for a login link.</p>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded bg-black/60 border border-gray-700 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button className="px-4 py-2 rounded bg-amber-500 text-black font-medium hover:bg-amber-400">
            Send magic link
          </button>
          {err && <p className="text-red-500">{err}</p>}
        </form>
      )}
    </main>
  );
}
