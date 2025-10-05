# Stripe Connect Implementation Guide

## Overview

HoldMyTime uses **Stripe Connect** to enable business owners to receive payments directly into their own Stripe accounts. This implementation uses the **Express** account type, which provides the fastest onboarding experience.

## How It Works

### Payment Flow

1. **Business Owner Signs Up**
   - Business owner creates an account and a booking page in HoldMyTime
   - They click "Connect Stripe Account" in the dashboard
   - HoldMyTime creates a Stripe Express account for them
   - Business owner completes Stripe onboarding (identity verification, bank details, etc.)

2. **Customer Makes a Booking**
   - Customer visits the business's booking page
   - Customer fills out booking form and proceeds to checkout
   - Payment is processed through Stripe Checkout
   - Funds are sent directly to the business owner's Stripe account
   - Platform automatically receives $2.00 fee per booking

3. **Money Distribution**
   - **Business receives**: Full deposit amount minus $2.00 platform fee (e.g., $48 on a $50 deposit)
   - **Platform receives**: $2.00 per booking automatically via application fee
   - All payments are deposited to respective Stripe accounts within 2-7 business days

### Revenue Model

HoldMyTime makes money through two revenue streams:

1. **Platform Fee per Booking**: $2.00 per deposit transaction (automatic via Stripe Connect)
2. **Monthly Subscription**: $15/month per business owner (includes 3-day free trial)

### Account Types

- **Platform Account**: HoldMyTime's main Stripe account (you)
- **Connected Accounts**: Individual Stripe Express accounts for each business owner
- Connected accounts are created and managed automatically by the application

## Architecture

### Database Schema

The implementation requires these fields in the `businesses` table:

```sql
stripe_account_id          TEXT       -- Connected account ID (acct_xxx)
stripe_account_status      TEXT       -- Status: not_connected, pending, active, restricted
stripe_onboarding_complete BOOLEAN    -- Whether onboarding is complete
stripe_charges_enabled     BOOLEAN    -- Whether account can accept charges
stripe_payouts_enabled     BOOLEAN    -- Whether account can receive payouts
```

And these fields in the `bookings` table:

```sql
stripe_transfer_id    TEXT     -- Transfer ID for funds sent to connected account
platform_fee_cents    INTEGER  -- Platform fee amount (typically 200 = $2.00)
```

### Key API Endpoints

1. **`/api/connect/create-account`** (POST)
   - Creates Stripe Express account for business
   - Generates onboarding link
   - Saves account ID to database

2. **`/api/create-checkout`** (POST)
   - Creates Stripe Checkout session
   - Uses connected account with application fee
   - Validates that business has active Stripe account

3. **`/api/stripe-webhook`** (POST)
   - Handles `checkout.session.completed` events
   - Handles `account.updated` events (updates business Stripe status)
   - Handles subscription events

### Component Architecture

- **`ConnectStripeButton.tsx`**: Client component showing Stripe connection status
  - Not connected: Shows "Connect Stripe Account" button
  - Pending: Shows "Complete Setup" button
  - Active: Shows green "Connected" status

## Setup Instructions

### 1. Enable Stripe Connect

1. Log into your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Connect** > **Settings**
3. Click **Get Started** if you haven't enabled Connect yet
4. Choose **Platform or marketplace** as your integration type
5. Fill out your platform information

### 2. Configure Connect Settings

In Stripe Dashboard > Connect > Settings:

- **Brand Name**: HoldMyTime (or your platform name)
- **Brand Color**: Your brand color (gold theme)
- **Brand Icon**: Upload your logo
- **Support Email**: Your support email
- **Support URL**: https://www.holdmytime.io/support

### 3. Enable Required Capabilities

For Express accounts, ensure these capabilities are enabled:
- Card payments
- Transfers

### 4. Set Up Webhook Endpoints

1. Go to **Developers** > **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your webhook URL: `https://www.holdmytime.io/api/stripe-webhook`
4. Select these events:
   - `checkout.session.completed`
   - `account.updated`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret
6. Add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 5. Verify API Key Permissions

1. Go to **Developers** > **API Keys**
2. Your Secret Key should show "Standard keys" or have Connect scope
3. If using restricted keys, ensure the key has these permissions:
   - Accounts: Write
   - Account Links: Write
   - Checkout Sessions: Write
   - Payment Intents: Write
   - Webhooks: Read

### 6. Run Database Migration

Execute the SQL from `STRIPE_CONNECT_MIGRATION.md` in your Supabase SQL editor.

### 7. Environment Variables

Ensure your `.env.local` has:

```bash
STRIPE_SECRET_KEY=sk_test_xxx  # Must have Connect permissions
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_SITE_URL=https://www.holdmytime.io
```

## User Flow

### Business Owner Onboarding

1. Business owner signs up and creates a booking page
2. Dashboard shows "Connect Stripe to Accept Payments" card
3. Clicks "Connect Stripe Account"
4. Application creates Express account via `/api/connect/create-account`
5. User redirected to Stripe onboarding
6. User completes:
   - Business details
   - Identity verification
   - Bank account information
7. User redirected back to dashboard
8. Webhook receives `account.updated` event
9. Database updated with account status
10. Dashboard shows green "Stripe Connected" status

### Customer Payment Flow

1. Customer visits booking page at `/business/[slug]`
2. Fills out booking form
3. Clicks "Reserve with Deposit"
4. Backend checks if business has active Stripe account
5. If yes: Creates Checkout session with connected account
6. If no: Returns error message
7. Customer completes payment on Stripe Checkout
8. Funds distributed:
   - Business receives deposit minus $2.00
   - Platform receives $2.00 fee
9. Webhook updates booking status
10. Customer sees success page

## Testing

### Test Mode

During development, use Stripe test mode:

1. Use test API keys (start with `sk_test_` and `pk_test_`)
2. Test webhook locally using Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3002/api/stripe-webhook
   ```
3. Use test card: `4242 4242 4242 4242`

### Test Scenarios

1. **Connect Account Creation**
   - Create new business
   - Click "Connect Stripe Account"
   - Complete onboarding with test data
   - Verify account shows as "active" in dashboard

2. **Payment with Platform Fee**
   - Create booking on connected account's page
   - Use test card to complete payment
   - Verify in Stripe Dashboard:
     - Payment appears in connected account's dashboard
     - Application fee appears in platform account

3. **Account Status Updates**
   - Trigger `account.updated` webhook
   - Verify database updates correctly

## Security Considerations

1. **API Key Security**
   - Never expose `STRIPE_SECRET_KEY` to client
   - Store in environment variables only
   - Use different keys for development/production

2. **Webhook Verification**
   - Always verify webhook signatures
   - Use `stripe.webhooks.constructEvent()`
   - Return 400 for invalid signatures

3. **Business Ownership**
   - Verify user owns business before creating Connect account
   - Check `owner_id` matches authenticated user

4. **Account Validation**
   - Check `stripe_account_status === 'active'` before accepting payments
   - Verify `charges_enabled` and `payouts_enabled` are true

## Troubleshooting

### "Business must connect Stripe account" Error

**Cause**: Business doesn't have `stripe_account_id` or status is not 'active'

**Solution**:
1. Check database: `SELECT stripe_account_id, stripe_account_status FROM businesses WHERE id = 'xxx'`
2. If no account: Business needs to complete Connect flow
3. If pending: Business needs to complete onboarding
4. If restricted: Check Stripe Dashboard for account issues

### Webhook Not Receiving Events

**Cause**: Webhook endpoint not configured or signature verification failing

**Solution**:
1. Verify webhook URL in Stripe Dashboard
2. Check `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
3. Ensure webhook endpoint is publicly accessible
4. Check server logs for signature errors

### Platform Fee Not Applied

**Cause**: Checkout session not created with application fee

**Solution**:
1. Verify `application_fee_amount: 200` in checkout session
2. Check that session is created with `stripeAccount` option
3. Verify platform account has Connect enabled

### Account Shows "Pending" Forever

**Cause**: Business didn't complete onboarding or requirements changed

**Solution**:
1. Check Stripe Dashboard > Connect > Accounts
2. Look for account with ID matching database
3. Check requirements and restrictions
4. Business may need to re-complete onboarding

## Going to Production

### Pre-Launch Checklist

- [ ] Run database migration in production Supabase
- [ ] Enable Stripe Connect in production account
- [ ] Set up production webhook endpoint
- [ ] Update environment variables to production keys
- [ ] Test full flow in production mode
- [ ] Set up webhook monitoring/alerts
- [ ] Configure payout schedule (daily/weekly/monthly)
- [ ] Review Stripe Connect Terms of Service
- [ ] Set up account monitoring

### Production Settings

1. Switch to live API keys (start with `sk_live_` and `pk_live_`)
2. Update webhook endpoint to production URL
3. Configure Connect settings for production
4. Test with real (small) transactions first
5. Monitor for errors in first 48 hours

## Support Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Express Accounts Guide](https://stripe.com/docs/connect/express-accounts)
- [Application Fees](https://stripe.com/docs/connect/charges#collecting-fees)
- [Account Webhooks](https://stripe.com/docs/connect/webhooks)
- [Testing Connect](https://stripe.com/docs/connect/testing)

## FAQ

**Q: How long does onboarding take?**
A: Usually 5-10 minutes. Identity verification may take longer for some users.

**Q: When do businesses get paid?**
A: Stripe's standard payout schedule is 2 business days (configurable in settings).

**Q: Can businesses see platform fees?**
A: Yes, application fees are visible in their Stripe dashboard under "Fees."

**Q: What happens if a business disputes the platform fee?**
A: Application fees are standard in Stripe Connect. Ensure your terms of service clearly state the fee structure.

**Q: Do we handle refunds?**
A: Refunds must be initiated by the platform. When refunded, the application fee is also refunded.

**Q: What countries are supported?**
A: Express accounts support 40+ countries. Check [Stripe's country list](https://stripe.com/global) for details.

**Q: Can a business have multiple booking pages?**
A: Yes, but each business record needs its own Stripe Connect account, or you can share one account across multiple pages for the same business owner.

**Q: What about compliance and taxes?**
A: Stripe handles tax forms (1099-K in US) for connected accounts. Platform is responsible for reporting application fee income.
