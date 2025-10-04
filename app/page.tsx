// app/page.tsx
import Link from 'next/link';

// IMPORTANT: use RELATIVE imports, not the '@' alias
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
              Login / Sign up
            </Link>
          </div>
        }
        signedIn={
          <div className="max-w-3xl space-y-8">
            <header className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Create your booking page</h1>
              <Link
                href="/dashboard"
                className="rounded-md border border-amber-500/40 bg-black px-3 py-1.5 text-amber-300 hover:bg-amber-500/10"
              >
                Go to Dashboard
              </Link>
            </header>

            <CreatePageForm />
          </div>
        }
      />
    </main>
  );
}
