// app/page.tsx
import Link from 'next/link';
import AuthGate from '@/components/AuthGate';


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
              className="inline-flex items-center rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-400"
            >
              Sign in
            </Link>
          </div>
        }
      >
        <div className="max-w-3xl space-y-4">
          <h1 className="text-2xl font-semibold">You’re signed in</h1>
          <p>Continue to your dashboard to manage booking pages.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md bg-yellow-500 px-4 py-2 font-medium text-black hover:bg-yellow-400"
          >
            Go to dashboard
          </Link>
        </div>
      </AuthGate>
    </main>
  );
}
