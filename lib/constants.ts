// Deposit tier options (in dollars)
export const DEPOSIT_TIERS = [25, 50, 75, 100] as const;

// Deposit tier options in cents for database storage
export const DEPOSIT_TIERS_CENTS = [2500, 5000, 7500, 10000] as const;

// Currency conversion
export const CENTS_PER_DOLLAR = 100;

// Platform fee per booking (in cents)
// This is the amount YOU earn per customer booking
export const PLATFORM_FEE_CENTS = 200; // $2.00

// Default site URL (fallback if env var not set)
export const DEFAULT_SITE_URL = process.env.NODE_ENV === 'production'
  ? 'https://www.holdmytime.io'
  : 'http://localhost:3000';

// Get site URL from environment or use default
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
