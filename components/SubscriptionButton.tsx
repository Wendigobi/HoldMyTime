'use client';

import { useState } from 'react';

export default function SubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/create-subscription', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to create subscription');
        setIsLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      alert('Failed to create subscription');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      className="btn w-full disabled:opacity-50"
    >
      {isLoading ? 'Loading...' : 'Subscribe Now — $15/month'}
    </button>
  );
}
