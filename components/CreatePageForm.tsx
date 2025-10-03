// /app/components/CreatePageForm.tsx
'use client';

import { useState } from 'react';

export default function CreatePageForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [deposit, setDeposit] = useState('$25'); // display value; server will parse
  const [category, setCategory] = useState('test'); // example "service"
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const payload = {
        email,
        name,
        slug,
        phone,
        support_email: supportEmail || email,
        deposit,           // "$25" -> server parses to 2500
        services: [category],
        test_mode: true,
      };

      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Robustly parse JSON so we can display the real error
      const raw = await res.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        // ignore, we'll show raw snippet below
      }

      if (!res.ok) {
        const detail = data?.message || raw?.slice(0, 200) || 'Unknown error';
        throw new Error(detail);
      }

      setMsg(`Success! Your page slug: ${data.slug}`);
    } catch (err: any) {
      setMsg(`Error: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        className="w-full border rounded p-2"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        type="email"
      />

      <input
        className="w-full border rounded p-2"
        placeholder="Business name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        className="w-full border rounded p-2"
        placeholder="Unique slug (e.g. glamcuts)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        required
      />

      <input
        className="w-full border rounded p-2"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        className="w-full border rounded p-2"
        placeholder="Support email (optional)"
        value={supportEmail}
        onChange={(e) => setSupportEmail(e.target.value)}
        type="email"
      />

      <input
        className="w-full border rounded p-2"
        placeholder="Deposit (e.g. $25)"
        value={deposit}
        onChange={(e) => setDeposit(e.target.value)}
      />

      <input
        className="w-full border rounded p-2"
        placeholder="Category / Service"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white rounded px-4 py-2"
      >
        {loading ? 'Creating…' : 'Create page'}
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
