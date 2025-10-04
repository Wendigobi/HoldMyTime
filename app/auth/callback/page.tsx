// app/auth/callback/page.tsx
import CallbackClient from './CallbackClient';

// Tell Next not to prerender and to use the Node runtime.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export default function AuthCallbackPage() {
  return <CallbackClient />;
}
