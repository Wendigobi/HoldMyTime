// lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Use a stable API version your account supports
  apiVersion: "2024-06-20",
});
