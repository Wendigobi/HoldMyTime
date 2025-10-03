// app/page.tsx
'use client'

import { useState } from 'react'

const TIERS = [
  { value: 25, label: '$25' },
  { value: 50, label: '$50' },
  { value: 75, label: '$75' },
  { value: 100, label: '$100' },
] as const

export default function HomePage() {
  const [msg, setMsg] = useState<string>('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg('')

    const form = new FormData(e.currentTarget)

    const payload = {
      owner_email: String(form.get('owner_email') || ''),
      name: String(form.get('name') || ''),
      slug: String(form.get('slug') || ''),
      phone: String(form.get('phone') || ''),
      email: String(form.get('public_email') || ''),
      // send a NUMBER (not "$75")
      price_tier: Number(form.get('tier') || 25),
      // optionally: collect services as comma-separated string
      services: [],
    }

    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const json = await res.json()
    if (!res.ok || !json.ok) {
      setMsg(json.error || 'Something went wrong.')
      return
    }

    setMsg(`Created! Share URL: /business/${json.slug}`)
  }

  return (
    <main style={{ maxWidth: 680, margin: '40px auto', padding: 16 }}>
      <h2>Create your booking page</h2>
      <p>Stripe checkout + confirmation. Fixed deposits.</p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input name="owner_email" type="email" placeholder="Your email" required />
        <input name="name" placeholder="Business name" required />
        <input name="slug" placeholder="Custom slug (optional, otherwise from name)" />
        <input name="phone" placeholder="Phone" />
        <input name="public_email" type="email" placeholder="Public contact email" />

        {/* The important part: value is numeric */}
        <select name="tier" defaultValue={25} required>
          {TIERS.map(t => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <button type="submit">Create page</button>
      </form>

      {msg && (
        <p style={{ marginTop: 12, color: msg.startsWith('Created!') ? 'limegreen' : 'crimson' }}>
          {msg}
        </p>
      )}
    </main>
  )
}
