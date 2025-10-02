// /app/dashboard/page.tsx
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-700 mb-6">
        Your dashboard placeholder is live. Wire this up to your Supabase data
        when you’re ready.
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <Link className="text-blue-600 underline" href="/">
            Back to Home
          </Link>
        </li>
      </ul>
    </main>
  );
}
