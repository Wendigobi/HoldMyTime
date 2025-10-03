// app/page.tsx
import Link from 'next/link';
import AuthGate from '../components/AuthGate';
import CreatePageForm from '../components/CreatePageForm';

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
          <div className="mx-auto max-w-2xl">
            <CreatePageForm />
            <div className="mt-4 text-sm">
              <Link href="/dashboard" className="underline">
                Go to your dashboard
              </Link>
              {' · '}
              <Link href="/logout" className="underline">
                Sign out
              </Link>
            </div>
          </div>
        }
      />
    </main>
  );
}
