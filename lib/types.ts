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
  deposit_cents: number;
  status: 'pending' | 'paid' | 'active' | 'inactive';
  checkout_session_id?: string;
  stripe_pay_link_url?: string;
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
  deposit_amount_cents: number;
  stripe_payment_intent_id?: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  notes?: string;
}

export type DepositTier = 25 | 50 | 75 | 100;
export type DepositTierCents = 2500 | 5000 | 7500 | 10000;
