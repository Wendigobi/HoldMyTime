// app/page.tsx
import Link from 'next/link';
import AuthGate from '@/components/AuthGate';
import CreatePageForm from '@/components/CreatePageForm';

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <AuthGate
        signedOut={
          <div className="mx-auto max-w-3xl space-y-8">
            <header className="rounded-3xl border border-amber-500/25 bg-black/40 p-8 text-center shadow-[0_8px_40px_rgba(255,200,0,0.08)] backdrop-blur">
              <h1 className="text-5xl font-extrabold tracking-tight text-amber-400">HoldMyTime</h1>
              <p className="mt-3 text-lg text-amber-100/85">
                Instant booking with a paid deposit — crush no-shows, keep your calendar full.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  href="/login"
                  className="rounded-xl bg-amber-500 px-5 py-2.5 font-medium text-black hover:bg-amber-400"
                >
                  Sign in
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-amber-500/40 bg-black px-5 py-2.5 text-amber-300 hover:bg-amber-500/10"
                >
                  View dashboard
                </Link>
              </div>
            </header>

            <section className="grid gap-3 text-amber-200/90 sm:grid-cols-3">
              <div className="rounded-2xl border border-amber-500/20 bg-black/40 p-4 backdrop-blur">1) Pick a deposit</div>
              <div className="rounded-2xl border border-amber-500/20 bg-black/40 p-4 backdrop-blur">2) Share your link</div>
              <div className="rounded-2xl border border-amber-500/20 bg-black/40 p-4 backdrop-blur">3) Get real bookings</div>
            </section>
          </div>
        }
        signedIn={
          <div className="mx-auto max-w-3xl space-y-6">
            <header className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-amber-300">Create a booking page</h2>
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
