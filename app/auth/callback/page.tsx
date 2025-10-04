// app/auth/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams(); // may be seen as nullable in strict TS
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

      const next = params?.get('next') || '/dashboard';
      router.replace(next);
      router.refresh();
    }

    run();
  }, [params, router]);

  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <div className="rounded-2xl border border-amber-500/25 bg-black/40 p-6 text-center text-amber-200 backdrop-blur">
        {error ? (
          <>
            <p className="mb-2 text-red-400">Auth error</p>
            <p className="text-sm">{error}</p>
          </>
        ) : (
          <p>Signing you in…</p>
        )}
      </div>
    </main>
  );
}
