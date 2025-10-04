"use client";

import { useState } from "react";

export default function BookingForm({
  businessId,
  deposit,
  support,
}: {
  businessId: string;
  deposit: number;
  support?: { phone?: string | null; email?: string | null };
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const payload = {
        business_id: businessId,        // <-- snake_case for the API
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        service,
        address,
        date,
        time,
        notes,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Prefer JSON response: { url: "https://checkout.stripe.com/..." }
      const ct = res.headers.get("content-type") || "";
      if (res.ok && ct.includes("application/json")) {
        const data = await res.json();
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
      }

      // Fallbacks in case of redirect response
      if (res.redirected && res.url) {
        window.location.href = res.url;
        return;
      }
      const loc = res.headers.get("Location");
      if (loc) {
        window.location.href = loc;
        return;
      }

      const text = await res.text().catch(() => "");
      throw new Error(text || "Failed to create booking");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-secondary">
            Full Name *
          </label>
          <input
            id="name"
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-secondary">
            Email *
          </label>
          <input
            id="email"
            type="email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium text-secondary">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            className="field"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label htmlFor="service" className="mb-2 block text-sm font-medium text-secondary">
            Service Type
          </label>
          <input
            id="service"
            className="field"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="e.g., HVAC Repair"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address" className="mb-2 block text-sm font-medium text-secondary">
            Service Address
          </label>
          <input
            id="address"
            className="field"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, City, State ZIP"
          />
        </div>

        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-medium text-secondary">
            Preferred Date
          </label>
          <input
            id="date"
            type="date"
            className="field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="time" className="mb-2 block text-sm font-medium text-secondary">
            Preferred Time
          </label>
          <input
            id="time"
            type="time"
            className="field"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="mb-2 block text-sm font-medium text-secondary">
            Additional Notes (Optional)
          </label>
          <input
            id="notes"
            className="field"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special requests or details..."
          />
        </div>
      </div>

      {err && (
        <div className="rounded-lg border-2 border-red-600 bg-red-950/30 p-3">
          <p className="text-sm text-red-400">{err}</p>
        </div>
      )}

      <div className="space-y-4 rounded-lg bg-black/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-secondary">Deposit Amount:</span>
          <span className="text-2xl font-bold text-gold">${deposit}</span>
        </div>
        <button
          disabled={loading}
          className="btn w-full"
        >
          {loading ? "Redirecting to Stripe…" : `Pay $${deposit} Deposit Now`}
        </button>
        <p className="text-center text-xs text-muted">
          Secure payment processing via Stripe
        </p>
      </div>

      {support && (support.phone || support.email) && (
        <div className="rounded-lg border border-gold/30 bg-gold/5 p-4 text-center">
          <p className="mb-1 text-sm font-medium text-gold">Need Assistance?</p>
          <p className="text-xs text-secondary">
            {support.phone && (
              <>
                Call <a href={`tel:${support.phone}`} className="text-gold hover:underline">{support.phone}</a>
              </>
            )}
            {support.phone && support.email && <span className="mx-1">•</span>}
            {support.email && (
              <>
                Email <a href={`mailto:${support.email}`} className="text-gold hover:underline">{support.email}</a>
              </>
            )}
          </p>
        </div>
      )}
    </form>
  );
}
