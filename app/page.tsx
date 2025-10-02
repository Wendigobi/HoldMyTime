// /app/page.tsx
import CreatePageForm from './components/CreatePageForm';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Hold My Time</h1>
        <nav className="space-x-4">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Book more jobs in 24h—with a deposit
        </h2>
        <p className="text-gray-600">
          Create your booking page in minutes. Fixed deposit ($25/$50/$75/$100).
          Stripe checkout + confirmation screen.
        </p>
      </section>

      <section className="bg-white border rounded p-6">
        <h3 className="text-lg font-semibold mb-4">Create your booking page</h3>
        <CreatePageForm />
      </section>
    </main>
  );
}
