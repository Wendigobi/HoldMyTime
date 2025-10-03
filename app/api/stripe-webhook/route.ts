// app/api/stripe-webhook/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const buf = Buffer.from(await req.arrayBuffer());

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle events here
  switch (event.type) {
    case "checkout.session.completed":
      // TODO: mark booking as paid, etc.
      break;
    default:
      // optionally log unhandled types
  }

  return NextResponse.json({ received: true });
}
