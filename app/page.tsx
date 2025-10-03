'use client';

import { useState } from 'react';

export default function Page() {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setOk(false);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd as any);

    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Error'); return; }

    setOk(true);
    e.currentTarget.reset();
  }

  return (
    <main className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 py-10">
      <section>
        <h1 className="text-4xl font-bold">Book more jobs in 24h — with a deposit.</h1>
        <p className="mt-4 opacity-80">
          Stop no-shows cold. Create a booking page with a fixed deposit ($25, $50, $75, or $100).
          Share it, get paid, get confirmations.
        </p>
      </section>

      <section>
        <form onSubmit={onSubmit} className="space-y-3">
          {/* YOU (owner) */}
          <input name="owner_email" placeholder="Your email (owner)" required className="w-full" />

          {/* Business name */}
          <input name="name" placeholder="Business name" required className="w-full" />

          {/* Slug (unique) */}
          <input name="slug" placeholder="Unique slug (e.g. shanes-cleaning)" required className="w-full" />

          {/* Public contact email (REQUIRED and often missing) */}
          <input name="email" placeholder="Public contact email" required className="w-full" />

          {/* Optional phone */}
          <input name="phone" placeholder="Phone (optional)" className="w-full" />

          {/* Deposit */}
          <select name="deposit" defaultValue="$25" required className="w-full">
            <option value="$25">$25</option>
            <option value="$50">$50</option>
            <option value="$75">$75</option>
            <option value="$100">$100</option>
          </select>

          <button type="submit" className="w-full">Create page</button>

          {ok && <div className="text-green-500">Created!</div>}
          {error && <div className="text-red-400">{error}</div>}
        </form>
      </section>
    </main>
  );
}
