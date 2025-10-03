'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Props = {
  signedIn: React.ReactNode;
  signedOut: React.ReactNode;
};

// Create a single browser client for this module.
// (The SSR package works fine in the browser; this is a client component.)
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthGate({ signedIn, signedOut }: Props) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<null | unknown>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      if (!mounted) return;
      setSession(sess);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;
  return session ? <>{signedIn}</> : <>{signedOut}</>;
}
