-- Migration: Add service pricing and flexible deposit system
-- Run this in Supabase SQL Editor

-- Add new columns to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS service_name TEXT,
ADD COLUMN IF NOT EXISTS service_price_cents INTEGER,
ADD COLUMN IF NOT EXISTS deposit_type TEXT DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS deposit_percentage INTEGER;

-- Add check constraint for deposit_type
ALTER TABLE businesses
ADD CONSTRAINT deposit_type_check
CHECK (deposit_type IN ('percentage', 'fixed'));

-- Add check constraint for deposit_percentage (must be 25, 50, 75, or 100 if used)
ALTER TABLE businesses
ADD CONSTRAINT deposit_percentage_check
CHECK (deposit_percentage IS NULL OR deposit_percentage IN (25, 50, 75, 100));

-- Update existing records to use 'fixed' deposit type
UPDATE businesses
SET deposit_type = 'fixed'
WHERE deposit_type IS NULL;

-- Add new columns to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS service_price_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_paid_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tip_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_remaining_cents INTEGER DEFAULT 0;

-- Update existing bookings to have service_price_cents = deposit_amount_cents for backwards compatibility
UPDATE bookings
SET service_price_cents = deposit_amount_cents,
    amount_paid_cents = deposit_amount_cents,
    balance_remaining_cents = 0
WHERE service_price_cents = 0;

-- Add comments for documentation
COMMENT ON COLUMN businesses.service_name IS 'Name of the service offered (e.g., "Men''s Haircut")';
COMMENT ON COLUMN businesses.service_price_cents IS 'Total price of service in cents';
COMMENT ON COLUMN businesses.deposit_type IS 'Type of deposit: "percentage" or "fixed"';
COMMENT ON COLUMN businesses.deposit_percentage IS 'Percentage for deposit if deposit_type is "percentage" (25, 50, 75, or 100)';
COMMENT ON COLUMN businesses.deposit_cents IS 'Fixed deposit amount in cents (used when deposit_type is "fixed")';

COMMENT ON COLUMN bookings.service_price_cents IS 'Total service price in cents';
COMMENT ON COLUMN bookings.amount_paid_cents IS 'Amount customer actually paid (between deposit and full price)';
COMMENT ON COLUMN bookings.tip_cents IS 'Optional tip amount in cents';
COMMENT ON COLUMN bookings.balance_remaining_cents IS 'Remaining balance due at appointment (service_price - amount_paid)';
