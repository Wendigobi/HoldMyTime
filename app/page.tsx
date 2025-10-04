// app/page.tsx
import Link from 'next/link';
import AuthGate from '@/components/AuthGate';
import CreatePageForm from '@/components/CreatePageForm';

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <AuthGate
        signedOut={
          <div className="mx-auto max-w-2xl space-y-6">
            <header className="space-y-2">
              <h1 className="text-4xl font-bold text-amber-400">HoldMyTime</h1>
              <p className="text-amber-100/80">
                Instant booking with a paid deposit—cut no-shows and get real jobs on the calendar.
              </p>
            </header>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-black hover:bg-amber-400"
              >
                Sign in to get started
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg border border-amber-500/40 bg-black px-4 py-2 text-amber-300 hover:bg-amber-500/10"
              >
                View dashboard
              </Link>
            </div>

            <ul className="grid gap-3 text-amber-200/90">
              <li>• Set your deposit ($25 / $50 / $75 / $100)</li>
              <li>• Share your booking page link</li>
              <li>• Get paid deposits via Stripe, reduce no-shows</li>
            </ul>
          </div>
        }
        signedIn={
          <div className="mx-auto max-w-3xl space-y-6">
            <header className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-amber-300">Welcome back</h2>
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
