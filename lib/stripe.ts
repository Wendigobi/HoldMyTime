// lib/stripe.ts
import Stripe from "stripe";

/**
 * Do NOT set apiVersion here unless you know you need a specific one.
 * Omitting it uses the SDK's built-in types and avoids type mismatch errors.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});
