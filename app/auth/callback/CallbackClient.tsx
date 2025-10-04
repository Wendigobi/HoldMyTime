'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function CallbackClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function run() {
      const code = params?.get('code');
      const errDesc = params?.get('error_description');

      if (errDesc) {
        setError(errDesc);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError(error.message);
          return;
        }
      }

      // Redirect to dashboard after successful auth
      router.push('/dashboard');
      router.refresh();
    }

    run();
  }, [params, router]);

  return (
    <div className="centered-layout">
      <div className="card-gold text-center max-w-md">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-400">Authentication Error</h2>
            <p className="text-secondary mb-6">{error}</p>
            <a href="/login" className="btn">
              Back to Login
            </a>
          </>
        ) : (
          <>
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-xl text-gold font-semibold">Signing you in...</p>
            <p className="text-secondary mt-2">Please wait a moment</p>
          </>
        )}
      </div>
    </div>
  );
}
