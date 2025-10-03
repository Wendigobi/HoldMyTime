'use client';

import { useState } from 'react';
import { z } from 'zod';

const createSchema = z.object({
  owner_email: z.string().email(),
  name: z.string().min(2).max(60),
  slug: z.string().min(2).max(64).regex(/^[a-z0-9-]+$/i, 'Letters, numbers, dashes only'),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  deposit: z.enum(['25', '50', '75', '100']),
  services: z.array(z.string()).optional(),
});

export default function Home() {
  const [form, setForm] = useState({
    owner_email: '',
    name: '',
    slug: '',
    email: '',
    phone: '',
    deposit: '50',
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const parsed = createSchema.safeParse(form);
    if (!parsed.success) {
      setMsg(parsed.error.issues[0]?.message ?? 'Invalid form');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ...parsed.data,
          deposit: Number(parsed.data.deposit),
          services: [],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      setMsg(`Created! Your booking page: /business/${json.data.slug}`);
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="mb-10 grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col justify-center">
          <h1 className="mb-4 text-4xl font-black tracking-tight">
            Book more jobs in <span className="text-gold-400">24h</span> — with a <span className="text-gold-400">deposit</span>.
          </h1>
          <p className="text-zinc-400">
            Stop no-shows cold. Create a booking page with a fixed deposit of $25, $50, $75, or $100. Share it, get paid, get confirmations.
          </p>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 text-xl font-semibold">Create your booking page</h2>
          <form onSubmit={onSubmit} className="grid gap-3">
            <input
              className="input"
              placeholder="Your account email"
              value={form.owner_email}
              onChange={(e) => setForm((f) => ({ ...f, owner_email: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Business name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Public slug (e.g. acme-mobile-detail)"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Public email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Public phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />

            <select
              className="select"
              value={form.deposit}
              onChange={(e) => setForm((f) => ({ ...f, deposit: e.target.value }))}
            >
              <option value="25">$25</option>
              <option value="50">$50</option>
              <option value="75">$75</option>
              <option value="100">$100</option>
            </select>

            <button className="btn-gold mt-2" disabled={loading}>
              {loading ? 'Creating…' : 'Create page'}
            </button>

            {msg && <p className="text-sm text-red-400">{msg}</p>}
          </form>
        </div>
      </section>
    </>
  );
}
