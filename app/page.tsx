// app/page.tsx (or wherever your create form lives)
'use client';

import { useState } from 'react';

export default function CreateForm() {
  const [ownerEmail, setOwnerEmail] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deposit, setDeposit] = useState<number>(50); // number!

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      owner_email: ownerEmail,
      name,
      slug,
      email,
      phone,
      deposit,           // number, not "$50"
      services: [],      // or whatever you collect
    };

    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      alert(json.error ?? 'Failed');
      return;
    }
    // success: json.data has the inserted row
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {/* other inputs... */}
      <select
        value={deposit}
        onChange={(e) => setDeposit(parseInt(e.target.value, 10))}
        className="border px-2 py-1"
      >
        <option value={25}>$25</option>
        <option value={50}>$50</option>
        <option value={75}>$75</option>
        <option value={100}>$100</option>
      </select>

      <button type="submit" className="border px-3 py-2">Create page</button>
    </form>
  );
}
