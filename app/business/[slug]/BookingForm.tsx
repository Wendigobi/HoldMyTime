"use client";

import { useState } from "react";

function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className="block text-sm font-medium text-gray-700 mb-1" />;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={
        "w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 " +
        (className ?? "")
      }
    />
  );
}

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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="service">Service</Label>
          <Input id="service" value={service} onChange={(e) => setService(e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="time">Time</Label>
          <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <div className="flex items-center gap-3">
        <button
          disabled={loading}
          className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm disabled:opacity-60"
        >
          {loading ? "Redirecting…" : `Pay $${deposit} Deposit`}
        </button>
        <p className="text-sm text-gray-600">
          You’ll be redirected to Stripe checkout.
        </p>
      </div>

      {support && (support.phone || support.email) ? (
        <p className="text-xs text-gray-500">
          Need help? {support.phone ? `Call ${support.phone}` : null}
          {support.phone && support.email ? " • " : null}
          {support.email ? support.email : null}
        </p>
      ) : null}
    </form>
  );
}
