// lib/stripe.ts
import Stripe from 'stripe';

// Keep version-typing simple to avoid mismatches during deploys.
// The default constructor accepts the key and auto-detects API version.
const key = process.env.STRIPE_SECRET_KEY as string;
if (!key) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

const stripe = new Stripe(key);
export default stripe;
export { stripe };
