# Stripe Connect Database Migration

## Instructions

Before using Stripe Connect features, you need to run the following SQL migration in your Supabase database.

## How to Run This Migration

1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor (left sidebar)
3. Create a new query
4. Copy and paste the SQL below
5. Click "Run" to execute the migration

## Migration SQL

```sql
-- Add Stripe Connect fields to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_account_status TEXT DEFAULT 'not_connected',
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_businesses_stripe_account ON businesses(stripe_account_id);

-- Add platform fee tracking to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT,
ADD COLUMN IF NOT EXISTS platform_fee_cents INTEGER DEFAULT 0;
```

## What This Migration Does

### Businesses Table Updates
- `stripe_account_id` - Stores the Stripe Connect account ID for the business
- `stripe_account_status` - Tracks the status of the Stripe account (not_connected, pending, active, restricted)
- `stripe_onboarding_complete` - Boolean flag indicating if Stripe onboarding is complete
- `stripe_charges_enabled` - Boolean flag indicating if the account can accept charges
- `stripe_payouts_enabled` - Boolean flag indicating if the account can receive payouts

### Bookings Table Updates
- `stripe_transfer_id` - Stores the Stripe transfer ID when funds are sent to connected account
- `platform_fee_cents` - Tracks the platform fee amount in cents (typically $2.00 = 200 cents)

### Indexes
- Creates an index on `stripe_account_id` for faster queries

## Verification

After running the migration, you can verify it worked by running:

```sql
-- Check businesses table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'businesses'
  AND column_name LIKE '%stripe%'
ORDER BY ordinal_position;

-- Check bookings table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
  AND column_name IN ('stripe_transfer_id', 'platform_fee_cents')
ORDER BY ordinal_position;
```

## Next Steps

After running this migration:
1. Ensure your Stripe account has Connect enabled
2. Update your environment variables if needed
3. Test the Connect flow in the dashboard
4. Refer to STRIPE_CONNECT_GUIDE.md for detailed setup instructions
