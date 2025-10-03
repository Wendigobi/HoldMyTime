'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function AuthGate({
  signedOut,
  children,
}: {
  signedOut: React.ReactNode;
  children: React.ReactNode;
}) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [isAuthed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-gray-400">Loading…</div>;
  return isAuthed ? <>{children}</> : <>{signedOut}</>;
}
