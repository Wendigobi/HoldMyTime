// Database types for Supabase tables

export interface Business {
  id: string;
  created_at: string;
  owner_id: string;
  owner_email?: string;
  business_name: string;
  slug: string;
  contact_email: string;
  phone?: string;
  // Service pricing
  service_name?: string;
  service_price_cents?: number;
  // Deposit configuration
  deposit_type: 'percentage' | 'fixed';
  deposit_percentage?: number; // 25, 50, 75, 100
  deposit_cents: number; // For fixed amounts or calculated minimum
  status: 'pending' | 'paid' | 'active' | 'inactive';
  checkout_session_id?: string;
  stripe_pay_link_url?: string;
  // Stripe Connect fields
  stripe_account_id?: string;
  stripe_account_status?: 'not_connected' | 'pending' | 'active' | 'restricted';
  stripe_onboarding_complete?: boolean;
  stripe_charges_enabled?: boolean;
  stripe_payouts_enabled?: boolean;
}

export interface Booking {
  id: string;
  created_at: string;
  business_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  service: string;
  booking_date: string;
  booking_time: string;
  deposit_paid: boolean;
  // Payment amounts
  service_price_cents: number; // Total service price
  deposit_amount_cents: number; // Required minimum deposit
  amount_paid_cents: number; // What customer actually paid (deposit to full price)
  tip_cents?: number; // Optional tip added
  balance_remaining_cents: number; // service_price - amount_paid (not including tip)
  stripe_payment_intent_id?: string;
  stripe_transfer_id?: string; // Track transfers to connected accounts
  platform_fee_cents?: number; // Track platform fee taken
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  notes?: string;
}

export type DepositTier = 25 | 50 | 75 | 100;
export type DepositTierCents = 2500 | 5000 | 7500 | 10000;

export interface User {
  id: string;
  email: string;
  created_at: string;
  subscription_status: 'trial' | 'active' | 'canceled' | 'past_due' | 'none';
  subscription_id?: string;
  trial_ends_at?: string;
  current_period_end?: string;
}
