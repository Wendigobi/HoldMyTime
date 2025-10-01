"use client";
import { useState } from "react";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError(undefined); setCreatedUrl(undefined);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries()) as any;

    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create business");
      setCreatedUrl(`${window.location.origin}/business/${json.slug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grid md:grid-cols-2 gap-8 items-start">
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Book more jobs in 24h — with a deposit
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Create your own booking page in minutes. Fixed deposit ($25/$50/$75/$100). Stripe checkout + confirmation screen.
        </p>
        <ul className="mt-6 space-y-2 text-gray-700">
          <li>• No-shows drop when you require a deposit</li>
          <li>• Share a simple link on Facebook/Google profile</li>
          <li>• Start in test mode, go live later</li>
        </ul>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-bold">Create your booking page</h3>
        <p className="muted">We’ll give you a link you can share right away.</p>
        <form onSubmit={handleCreate} className="mt-4 space-y-3">
          <input name="owner_email" required className="field" placeholder="Your email (for edits)" />
          <input name="name" required className="field" placeholder="Business name (e.g., Mike's Cleaning)" />
          <input name="slug" required className="field" placeholder="Slug (e.g., mikescleaning)" />
          <input name="phone" className="field" placeholder="Phone (for customers)" />
          <input name="email" className="field" placeholder="Support email (for receipts)" />
          <select name="deposit" required className="field">
            <option value="">Deposit amount…</option>
            <option value="25">$25</option>
            <option value="50">$50</option>
            <option value="75">$75</option>
            <option value="100">$100</option>
          </select>
          <input name="services" className="field" placeholder="Services (comma-separated)" />
          <button className="btn" disabled={loading}>
            {loading ? "Creating…" : "Create page"}
          </button>
        </form>
        {createdUrl && (
          <div className="mt-4">
            <p className="font-semibold">Your page is ready:</p>
            <a className="text-blue-600 underline" href={createdUrl}>{createdUrl}</a>
          </div>
        )}
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>
    </section>
  );
}
