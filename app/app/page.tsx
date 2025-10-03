'use client'

import { useState } from 'react'

export default function HomeForm() {
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null); setOk(false)

    const fd = new FormData(e.currentTarget)
    const payload = Object.fromEntries(fd as any)

    const res = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Error')
      return
    }
    setOk(true)
    e.currentTarget.reset()
  }

  return (
    <div className="container grid md:grid-cols-2 gap-10 py-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold">
          Book more jobs in 24h — <span className="text-gold">with a deposit.</span>
        </h1>
        <p className="mt-4 text-muted">
          Stop no-shows cold. Create a booking page with a fixed deposit of $25, $50, $75, or $100.
          Share it, get paid, get confirmations.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <input name="owner_email" placeholder="Your email (owner)" required />
        <input name="name" placeholder="Business name" required />
        <input name="slug" placeholder="Unique slug (e.g. shanes-cleaning)" required />
        <input name="email" placeholder="Public contact email" required />
        <input name="phone" placeholder="Phone" />
        <select name="deposit" defaultValue="$25">
          <option value="$25">$25</option>
          <option value="$50">$50</option>
          <option value="$75">$75</option>
          <option value="$100">$100</option>
        </select>
        <button type="submit">Create page</button>

        {ok && <div className="text-gold">Created!</div>}
        {error && <div style={{color:'#f87171'}}>{error}</div>}
      </form>
    </div>
  )
}
