// components/ConnectStripeButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ConnectStripeButton({ 
  businessId, 
  stripeAccountId,
  stripeAccountStatus 
}: { 
  businessId: string;
  stripeAccountId?: string;
  stripeAccountStatus?: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check status when returning from Stripe onboarding
  useEffect(() => {
    const checkComplete = searchParams?.get('connect_complete');
    if (checkComplete === 'true' && stripeAccountId && stripeAccountStatus === 'pending') {
      checkAccountStatus();
    }
  }, [searchParams]);

  const checkAccountStatus = async () => {
    try {
      const res = await fetch('/api/connect/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error('Status check error:', err);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      // Use refresh-link endpoint if account exists, otherwise create new
      const endpoint = stripeAccountId 
        ? '/api/connect/refresh-link'
        : '/api/connect/create-account';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to create Stripe account');
        setLoading(false);
        return;
      }

      // Redirect to Stripe onboarding
      window.location.href = data.onboardingUrl;
    } catch (err) {
      console.error('Connect error:', err);
      alert('Failed to connect Stripe account');
      setLoading(false);
    }
  };

  // Already connected
  if (stripeAccountId && stripeAccountStatus === 'active') {
    return (
      <div className="rounded-lg bg-green-950/30 border-2 border-green-600 p-3">
        <p className="text-sm text-green-400">✓ Stripe Connected - Ready to accept payments</p>
      </div>
    );
  }

  // Pending onboarding
  if (stripeAccountId && stripeAccountStatus === 'pending') {
    return (
      <div className="rounded-lg bg-yellow-950/30 border-2 border-yellow-600 p-3">
        <p className="text-sm text-yellow-400 mb-2">⚠️ Stripe setup incomplete</p>
        <div className="flex gap-2">
          <button onClick={handleConnect} disabled={loading} className="btn-outline btn-small">
            {loading ? 'Loading...' : 'Complete Setup'}
          </button>
          <button onClick={checkAccountStatus} className="btn-small text-xs">
            Refresh Status
          </button>
        </div>
      </div>
    );
  }

  // Not connected
  return (
    <div className="rounded-lg bg-gold/10 border-2 border-gold p-4">
      <h4 className="font-bold text-gold mb-2">Connect Stripe to Accept Payments</h4>
      <p className="text-sm text-secondary mb-3">
        Connect your Stripe account to receive deposit payments directly from customers.
      </p>
      <button 
        onClick={handleConnect} 
        disabled={loading}
        className="btn"
      >
        {loading ? 'Creating Account...' : 'Connect Stripe Account'}
      </button>
    </div>
  );
}
