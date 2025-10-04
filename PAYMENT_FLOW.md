# Payment Flow Documentation

This document explains how payments flow through the HoldMyTime booking platform, including how businesses get paid and how the platform generates revenue.

## Overview

HoldMyTime is a two-sided payment platform:
1. **Customers** pay deposits to **Businesses** when booking appointments
2. **Businesses** pay monthly subscriptions to **HoldMyTime** (the platform owner)

## Payment Flow Diagrams

### Customer Deposit Flow (Booking Payment)

```
Customer Books Appointment
         |
         v
Customer Pays Deposit via Stripe
         |
         v
Stripe Processes Payment
         |
         v
Deposit Goes Directly to Business Stripe Account
         |
         v
Business Receives Funds (minus Stripe fees)
         |
         v
Webhook Updates Booking Status to "Paid"
```

**Key Points:**
- Customers pay deposits ranging from $25 to $100 (configurable by business)
- Payments are processed through Stripe Checkout
- Deposits go **directly** to the business owner's Stripe account
- The platform does NOT take a cut of customer deposits
- Stripe charges standard processing fees (2.9% + 30¢) which are deducted from the business's deposit

### Platform Subscription Flow (Your Revenue)

```
Business Owner Signs Up
         |
         v
Business Owner Starts 3-Day Free Trial
         |
         v
Trial Period Ends
         |
         v
Stripe Charges $15/month to Business Owner
         |
         v
Funds Go to Platform Owner Stripe Account (Your Account)
         |
         v
Webhook Updates User Subscription Status
```

**Key Points:**
- Business owners pay $15/month for unlimited booking pages
- 3-day free trial (no credit card required)
- Recurring monthly subscription via Stripe
- Revenue goes directly to the platform owner (you)
- Stripe charges standard processing fees on the $15 subscription

## How Money Flows

### 1. Business Gets Paid (Customer Deposits)

When a customer books an appointment:

1. Customer fills out booking form on the business's public booking page
2. Customer is redirected to Stripe Checkout to pay the deposit
3. Stripe processes the payment using the **business owner's Stripe account**
4. Funds are deposited into the **business owner's bank account** (via Stripe)
5. Stripe webhook notifies the platform that payment was successful
6. Platform marks the booking as "paid" in the database

**Business receives:** Deposit amount minus Stripe fees (e.g., $50 deposit - ~$1.75 fee = ~$48.25)

### 2. Platform Gets Paid (Monthly Subscriptions)

When a business owner subscribes:

1. Business owner creates an account on HoldMyTime
2. Business owner starts a 3-day free trial
3. After trial ends, Stripe automatically charges $15/month
4. Stripe processes payment to the **platform owner's Stripe account**
5. Funds are deposited into the **platform owner's bank account** (via Stripe)
6. Stripe webhook notifies the platform about subscription status changes
7. Platform updates user's subscription status in the database

**Platform receives:** $15/month minus Stripe fees (e.g., $15 - ~$0.74 fee = ~$14.26)

## Payment Configuration

### Stripe Account Setup

The platform requires **two types of Stripe integrations**:

#### 1. Business Stripe Accounts (for receiving deposits)
- Each business owner connects their own Stripe account
- Customers' deposit payments go directly to these accounts
- Business manages their own payouts and settings in Stripe

#### 2. Platform Stripe Account (for subscriptions)
- Platform owner has a main Stripe account
- All subscription payments ($15/month) are processed through this account
- Platform owner receives all subscription revenue

### Environment Variables Required

```
# Platform Stripe Account (for subscriptions)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# For Business Stripe Connect (if using Connect for deposits)
STRIPE_CONNECT_CLIENT_ID=ca_...
```

## Revenue Model

### Platform Revenue Calculation

**Per Business Per Month:** $15

**Monthly Revenue Example:**
- 10 active businesses × $15 = $150/month
- 50 active businesses × $15 = $750/month
- 100 active businesses × $15 = $1,500/month
- 500 active businesses × $15 = $7,500/month

**Annual Revenue Example:**
- 100 active businesses × $15 × 12 months = $18,000/year
- 500 active businesses × $15 × 12 months = $90,000/year

### Business Revenue Calculation (Examples)

Businesses collect deposits directly from customers:

**HVAC Company Charging $50 Deposits:**
- 20 bookings/month × $50 = $1,000/month in deposits
- Cost: $15/month subscription
- Net benefit: $985/month additional cash flow from deposits

**Plumbing Company Charging $75 Deposits:**
- 30 bookings/month × $75 = $2,250/month in deposits
- Cost: $15/month subscription
- Net benefit: $2,235/month additional cash flow from deposits

## Subscription Management

### Subscription States

Users can have the following subscription statuses:

- **`none`**: No subscription, cannot create booking pages
- **`trial`**: In 3-day free trial, can create unlimited pages
- **`active`**: Paid subscription, full access
- **`past_due`**: Payment failed, grace period before cancellation
- **`canceled`**: Subscription ended, no access to create new pages

### Trial Period

- **Duration:** 3 days
- **Credit Card:** Not required for trial
- **Access:** Full platform access during trial
- **After Trial:** Automatic conversion to paid subscription if payment method added

### Subscription Enforcement

The platform enforces subscriptions as follows:

1. **Creating Booking Pages:** Requires active subscription or trial status
2. **Viewing Existing Pages:** Always available (even with canceled subscription)
3. **Receiving Bookings:** Always works (customer deposits always accepted)
4. **Managing Bookings:** Always available

## Webhook Events

### Important Stripe Webhooks

The platform listens for these webhook events:

#### Subscription Events (Platform Revenue)
- `customer.subscription.created` - New subscription started
- `customer.subscription.updated` - Subscription status changed
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Monthly payment successful
- `invoice.payment_failed` - Monthly payment failed

#### Checkout Events (Business Deposits)
- `checkout.session.completed` - Customer deposit payment successful
- `payment_intent.succeeded` - Payment confirmed

## Security Considerations

1. **Stripe Keys:** Never expose secret keys in client-side code
2. **Webhook Signatures:** Always verify webhook signatures to prevent fraud
3. **User Permissions:** Verify user owns business before allowing modifications
4. **Payment Metadata:** Store user_id and business_id in Stripe metadata for tracking

## Testing

### Test Mode Setup

Use Stripe test mode for development:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Test Card Numbers

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Authentication: `4000 0025 0000 3155`

### Test Subscriptions

- Use test mode to create subscriptions without real charges
- Set trial period to 1 minute for faster testing
- Use Stripe CLI to trigger webhook events locally

## Support & Troubleshooting

### Common Issues

**Subscription not activating:**
- Check webhook endpoint is configured correctly
- Verify webhook secret matches environment variable
- Check Stripe dashboard for failed webhook deliveries

**Deposit payments not recording:**
- Ensure business_id is passed in Stripe metadata
- Verify checkout.session.completed webhook is firing
- Check database permissions for updating booking status

**Trial not converting to paid:**
- Confirm customer added payment method during trial
- Check for failed payment attempts in Stripe
- Review subscription status in database matches Stripe

## Future Enhancements

Potential payment flow improvements:

1. **Stripe Connect Integration:** Allow seamless onboarding of business Stripe accounts
2. **Platform Fee:** Take a small percentage of each deposit (e.g., 2-3%)
3. **Tiered Pricing:** Offer different subscription levels ($15 basic, $30 pro, $50 enterprise)
4. **Annual Billing:** Offer discounted annual subscriptions ($150/year = $12.50/month)
5. **Usage-Based Pricing:** Charge based on number of bookings processed
