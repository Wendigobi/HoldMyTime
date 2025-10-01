// lib/stripe.ts
import Stripe from "stripe";

// Pin to typings your project expects, which fixes the Vercel build error.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});
