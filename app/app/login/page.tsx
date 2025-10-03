'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabasePublic';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard` }
    });
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <div className="mx-auto max-w-md card p-6">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>
      {sent ? (
        <p>Magic link sent! Check your email.</p>
      ) : (
        <form onSubmit={sendLink} className="grid gap-3">
          <input
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn-gold">Send magic link</button>
          {err && <p className="text-red-400 text-sm">{err}</p>}
        </form>
      )}
    </div>
  );
}
