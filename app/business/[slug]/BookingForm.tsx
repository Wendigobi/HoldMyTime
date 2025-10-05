"use client";

import { useState } from "react";

export default function BookingForm({
  businessId,
  serviceName,
  servicePrice,
  deposit,
  support,
}: {
  businessId: string;
  serviceName?: string | null;
  servicePrice?: number | null; // in dollars
  deposit: number; // minimum deposit in dollars
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

  // Payment options
  const [paymentAmount, setPaymentAmount] = useState(deposit); // What customer chooses to pay
  const [tipPercentage, setTipPercentage] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Calculate tip amount
  const getTipAmount = (): number => {
    if (tipPercentage !== null && servicePrice) {
      return servicePrice * (tipPercentage / 100);
    }
    if (customTip && parseFloat(customTip) > 0) {
      return parseFloat(customTip);
    }
    return 0;
  };

  const tipAmount = getTipAmount();
  const totalAmount = paymentAmount + tipAmount;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      // Validation
      if (servicePrice && paymentAmount > servicePrice) {
        setErr(`Payment amount cannot exceed service price of $${servicePrice.toFixed(2)}`);
        setLoading(false);
        return;
      }

      if (paymentAmount < deposit) {
        setErr(`Payment amount must be at least $${deposit.toFixed(2)}`);
        setLoading(false);
        return;
      }

      const payload = {
        business_id: businessId,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        service: service || serviceName || '',
        address,
        date,
        time,
        notes,
        // Payment details
        amount_to_pay: Math.round(paymentAmount * 100), // cents
        tip_amount: Math.round(tipAmount * 100), // cents
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

  const hasFullPrice = servicePrice && servicePrice > deposit;
  const balanceRemaining = servicePrice ? servicePrice - paymentAmount : 0;

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
            placeholder={serviceName || "e.g., HVAC Repair"}
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

      {/* Payment Options */}
      <div className="space-y-4 rounded-lg border-2 border-gold/30 bg-black/30 p-6">
        <h3 className="text-lg font-semibold text-gold">Payment Details</h3>

        {/* Payment Amount Selector */}
        {hasFullPrice ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-secondary">
              How much would you like to pay now?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPaymentAmount(deposit)}
                className={paymentAmount === deposit ? 'btn flex-1' : 'btn-outline flex-1'}
              >
                Deposit Only
                <br />
                <span className="text-lg font-bold">${deposit.toFixed(0)}</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentAmount(servicePrice!)}
                className={paymentAmount === servicePrice ? 'btn flex-1' : 'btn-outline flex-1'}
              >
                Pay in Full
                <br />
                <span className="text-lg font-bold">${servicePrice!.toFixed(0)}</span>
              </button>
            </div>
            {paymentAmount === deposit && balanceRemaining > 0 && (
              <p className="mt-2 text-sm text-muted">
                Remaining balance of ${balanceRemaining.toFixed(2)} due at appointment
              </p>
            )}
            {paymentAmount === servicePrice && (
              <p className="mt-2 text-sm text-gold">
                ✓ No payment needed at appointment
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between py-2">
            <span className="text-secondary">Payment Amount:</span>
            <span className="text-2xl font-bold text-gold">${deposit.toFixed(2)}</span>
          </div>
        )}

        {/* Tip Options */}
        <div className="border-t border-gold/20 pt-4">
          <label className="mb-2 block text-sm font-medium text-secondary">
            Add a tip? (Optional)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {[10, 15, 20].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => {
                  setTipPercentage(pct);
                  setCustomTip('');
                }}
                className={tipPercentage === pct ? 'btn-small' : 'btn-outline btn-small'}
                style={{ flex: '1 0 auto' }}
              >
                {pct}%
                {servicePrice && (
                  <span className="ml-1 text-xs">(${(servicePrice * (pct / 100)).toFixed(2)})</span>
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setTipPercentage(null)}
              className={tipPercentage === null && !customTip ? 'btn-small' : 'btn-outline btn-small'}
              style={{ flex: '1 0 auto' }}
            >
              No Tip
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className="field pl-8 text-sm"
              placeholder="Custom tip amount"
              value={customTip}
              onChange={(e) => {
                setCustomTip(e.target.value);
                setTipPercentage(null);
              }}
            />
          </div>
        </div>

        {/* Total Summary */}
        <div className="border-t border-gold/20 pt-4 space-y-2">
          <div className="flex justify-between text-secondary">
            <span>Service Payment:</span>
            <span>${paymentAmount.toFixed(2)}</span>
          </div>
          {tipAmount > 0 && (
            <div className="flex justify-between text-secondary">
              <span>Tip:</span>
              <span>${tipAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold text-gold border-t border-gold/20 pt-2">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <button
          disabled={loading}
          className="btn w-full"
        >
          {loading ? "Redirecting to Stripe…" : `Pay $${totalAmount.toFixed(2)} Now`}
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
