-- Add Stripe Connect fields to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_account_status TEXT DEFAULT 'not_connected',
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_businesses_stripe_account ON businesses(stripe_account_id);

-- Update types to include new statuses
COMMENT ON COLUMN businesses.stripe_account_status IS 'Status: not_connected, pending, active, restricted';
