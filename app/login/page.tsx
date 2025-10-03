'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null);
    setSending(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/dashboard`
      }
    });

    setSending(false);
    if (error) setErr(error.message);
    else setMsg('Check your email for the login link. 👍');
  }

  return (
    <main className="min-h-[80vh] bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-zinc-900/60 p-6 shadow-xl">
        <h1 className="text-3xl font-bold text-amber-400">Sign in</h1>
        <p className="mt-2 opacity-80">
          Enter your email and we&apos;ll send you a secure login link.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg bg-black/50 border border-amber-500/30 px-4 py-3 outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3 transition disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Send magic link'}
          </button>
        </form>

        {msg && <p className="mt-4 text-green-400">{msg}</p>}
        {err && <p className="mt-4 text-red-400">{err}</p>}
      </div>
    </main>
  );
}
