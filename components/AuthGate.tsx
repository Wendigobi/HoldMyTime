// components/AuthGate.tsx
'use client';

import { useEffect, useState } from 'react';

type Props = {
  signedOut: React.ReactNode;
  signedIn: React.ReactNode;
};

/**
 * Extremely small “gate”: checks a session token cookie flag.
 * Replace this later with your real Supabase auth check.
 */
export default function AuthGate({ signedOut, signedIn }: Props) {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    // naive client-side check for a cookie flag
    const hasFlag =
      typeof document !== 'undefined' &&
      document.cookie.split('; ').some((c) => c.startsWith('hmtauthed=1'));

    setAuthed(hasFlag);
  }, []);

  if (authed === null) return null; // or a spinner
  return <>{authed ? signedIn : signedOut}</>;
}
