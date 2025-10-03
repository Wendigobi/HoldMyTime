// app/api/create-checkout/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const { amount, currency, successUrl, cancelUrl } = await req.json();

  // Example: create a Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: amount, // in cents
          product_data: { name: "Booking deposit" },
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return NextResponse.json({ url: session.url });
}
