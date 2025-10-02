// lib/stripe.ts
import Stripe from "stripe";

// Do not set apiVersion here to avoid TypeScript literal mismatches
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});
