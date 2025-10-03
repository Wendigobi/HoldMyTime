"use client";
import { useState } from "react";

export default function BookingForm({ business }: { business: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(undefined);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries()) as any;

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business.id, ...payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create checkout");
      window.location.href = json.checkoutUrl;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input name="customer_name" required className="field" placeholder="Jane Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input name="customer_email" type="email" required className="field" placeholder="jane@example.com" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input name="customer_phone" required className="field" placeholder="(555) 555-5555" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Service</label>
          <input name="service" required className="field" placeholder="e.g., House Cleaning — Standard" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <input name="address" required className="field" placeholder="123 Main St, City, ST" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input name="date" type="date" required className="field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input name="time" type="time" required className="field" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes (optional)</label>
        <input name="notes" className="field" placeholder="Gate code, pets, etc." />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Redirecting…" : `Pay $${business.deposit} Deposit`}
        </button>
        <span className="muted">You’ll be redirected to Stripe checkout.</span>
      </div>
    </form>
  );
}
