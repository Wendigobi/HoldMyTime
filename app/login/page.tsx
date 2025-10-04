'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { SITE_URL } from '../../lib/constants';

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
          emailRedirectTo: `${SITE_URL}/auth/callback`
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

  async function signInWithGoogle() {
    setErr(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${SITE_URL}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (e: any) {
      setErr(e?.message ?? 'Google sign-in failed.');
      setLoading(false);
    }
  }

  return (
    <div className="centered-layout">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3">HoldMyTime</h1>
          <p className="text-secondary text-lg">Welcome back! Sign in to continue</p>
        </div>

        <div className="card-gold">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gold">Check your email</h2>
              <p className="text-secondary mb-6">We sent a magic link to <span className="text-gold">{email}</span></p>
              <button onClick={() => setSent(false)} className="btn-outline">
                Try another email
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="w-full mb-6 flex items-center justify-center gap-3 rounded-xl border-2 border-white/20 bg-white text-black px-6 py-3 font-semibold hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Redirecting...' : 'Continue with Google'}
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted">Or sign in with email</span>
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-secondary">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="field"
                    disabled={loading}
                  />
                </div>

                {err && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-sm text-red-400">{err}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-full"
                >
                  {loading ? 'Sending...' : 'Send magic link'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-secondary hover:text-gold transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
