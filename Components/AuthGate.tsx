'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Props = {
  signedOut: React.ReactNode;
  signedIn: React.ReactNode;
};

export default function AuthGate({ signedOut, signedIn }: Props) {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // initial session
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthed(!!data.session);
      setLoading(false);
    });

    // react to future changes
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setIsAuthed(!!session);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;
  return isAuthed ? <>{signedIn}</> : <>{signedOut}</>;
}
