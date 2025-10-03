'use client';

import { useState } from 'react';

export default function HomePage() {
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
    <main className="bg-black text-white min-h-[80vh]">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 py-14 px-6">
        <section>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            <span className="text-amber-400">Book more jobs</span> in 24h — with a deposit.
          </h1>
          <p className="mt-4 opacity-80">
            Create a booking page with a fixed deposit ($25, $50, $75, or $100).
            Share it, get paid, get confirmations.
          </p>
        </section>

        <section>
          <div className="rounded-2xl border border-amber-500/30 bg-zinc-900/40 p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-amber-400">Create your booking page</h2>
            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <input name="owner_email" placeholder="Your email (owner)" required className="w-full rounded bg-black/50 border border-amber-500/30 px-4 py-3 outline-none focus:border-amber-400" />
              <input name="name" placeholder="Business name" required className="w-full rounded bg-black/50 border border-amber-500/30 px-4 py-3 outline-none focus:border-amber-400" />
              <input name="slug" placeholder="Unique slug (e.g. spotless-pros)" required className="w-full rounded bg-black/50 border border-amber-500/30 px-4 py-3 outline-none focus:border-amber-400" />
              <input name="email" placeholder="Public contact email" required className="w-full rounded bg-black/50 border border-amber-500/30 px-4 py-3 outline-none focus:border-amber-400" />
              <input name="phone" placeholder="Phone (optional)" className="w-full rounded bg-black/50 border border-amber-500/30 px-4 py-3 outline-none focus:border-amber-400" />
              <select name="deposit" defaultValue="$25" required className="w-full rounded bg-black/50 border border-amber-500/30 px-4 py-3 outline-none focus:border-amber-400">
                <option value="$25">$25</option>
                <option value="$50">$50</option>
                <option value="$75">$75</option>
                <option value="$100">$100</option>
              </select>

              <button type="submit" className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3 transition">
                Create page
              </button>

              {ok && <div className="text-green-400">Created! Check your dashboard.</div>}
              {error && <div className="text-red-400">{error}</div>}
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
