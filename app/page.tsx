// app/page.tsx
import Link from 'next/link';
import AuthGate from '@/components/AuthGate';        // alias (requires /components/AuthGate.tsx at repo root)
// import AuthGate from '../components/AuthGate';    // <-- relative fallback if you prefer

import CreatePageForm from './components/createpageform'; // keep your form where it already is

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <AuthGate
        signedOut={
          <div className="max-w-xl space-y-4">
            <h1 className="text-2xl font-semibold">Welcome</h1>
            <p>Please sign in to create and manage your booking pages.</p>
            <Link
              href="/login"
              className="inline-flex items-center rounded-md bg-amber-500 px-4 py-2 font-medium text-black hover:bg-amber-400"
            >
              Sign in
            </Link>
          </div>
        }
        signedIn={
          <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-semibold">Create your booking page</h1>
            <CreatePageForm />
            <p className="text-sm text-muted-foreground">
              Need to see your pages? Go to your{' '}
              <Link href="/dashboard" className="underline underline-offset-4">
                dashboard
              </Link>.
            </p>
          </div>
        }
      />
    </main>
  );
}
