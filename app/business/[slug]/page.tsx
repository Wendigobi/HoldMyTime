"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PageProps = {
  params: { slug: string };
};

export default function BusinessBookingPage({ params }: PageProps) {
  const router = useRouter();
  const { slug } = params;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const fd = new FormData(e.currentTarget);

      // Collect fields
      const customer_name = (fd.get("customer_name") as string)?.trim();
      const customer_email = (fd.get("customer_email") as string)?.trim();
      const customer_phone = (fd.get("customer_phone") as string)?.trim();
      const address = (fd.get("address") as string)?.trim();
      const service = (fd.get("service") as string)?.trim();
      const date = (fd.get("date") as string)?.trim();
      const time = (fd.get("time") as string)?.trim();
      const notes = (fd.get("notes") as string)?.trim();

      // Deposit value submitted as **cents** (integer)
      const deposit_cents = parseInt(fd.get("deposit_cents") as string, 10);

      if (!deposit_cents || Number.isNaN(deposit_cents) || deposit_cents <= 0) {
        throw new Error("Please choose a valid deposit amount.");
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          customer_name,
          customer_email,
          customer_phone,
          address,
          service,
          date,
          time,
          notes,
          deposit_cents,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong.");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url as string;
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-1">{slug}</h1>
      <p className="text-sm text-gray-500 mb-6">Deposit required: choose below</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={onSubmit} className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              name="customer_name"
              required
              className="w-full rounded border px-3 py-2"
              placeholder="Jane Doe"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="customer_email"
                type="email"
                required
                className="w-full rounded border px-3 py-2"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                name="customer_phone"
                className="w-full rounded border px-3 py-2"
                placeholder="(555) 555-5555"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Service</label>
            <input
              name="service"
              className="w-full rounded border px-3 py-2"
              placeholder="e.g., House Cleaning — Standard"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              name="address"
              className="w-full rounded border px-3 py-2"
              placeholder="123 Main St, City, ST"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                name="date"
                type="date"
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                name="time"
                type="time"
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deposit amount</label>
            {/* Values are **cents** */}
            <select
              name="deposit_cents"
              className="w-full rounded border px-3 py-2"
              defaultValue="5000"
              required
            >
              <option value="2500">$25</option>
              <option value="5000">$50</option>
              <option value="7500">$75</option>
              <option value="10000">$100</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <input
              name="notes"
              className="w-full rounded border px-3 py-2"
              placeholder="Gate code, pets, etc."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Redirecting…" : "Pay Deposit"}
          </button>

          <p className="text-xs text-gray-500 mt-2">
            You’ll be redirected to Stripe checkout.
          </p>
        </form>

        <aside className="md:col-span-1 border rounded p-4 text-sm">
          <h2 className="font-medium mb-2">How it works</h2>
          <ol className="list-decimal list-inside space-y-1 text-gray-700">
            <li>Fill details & pick a time</li>
            <li>Pay the deposit on Stripe</li>
            <li>You’ll receive a confirmation</li>
          </ol>
          <p className="text-xs text-gray-500 mt-4">Questions? Shown on business profile.</p>
        </aside>
      </div>
    </div>
  );
}
