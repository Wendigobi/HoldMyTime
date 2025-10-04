// components/AuthGate.tsx
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient, type Session } from '@supabase/ssr';

type Props = {
  signedOut: React.ReactNode;
  signedIn: React.ReactNode;
};

export default function AuthGate({ signedOut, signedIn }: Props) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess ?? null);
    });

    load();
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return null; // could render a spinner
  return <>{session ? signedIn : signedOut}</>;
}
