// app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// No body parser config needed in App Router. We'll read raw text.

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    console.error("Missing Stripe webhook secret/signature");
    return new NextResponse("Bad Request", { status: 400 });
  }

  let event: any;
  try {
    const raw = await req.text(); // raw body for verification
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        // TODO: mark booking as paid, etc.
        break;
      }
      case "checkout.session.expired": {
        // TODO: handle expired session
        break;
      }
      default:
        // keep silent for unhandled event types
        break;
    }
  } catch (err: any) {
    console.error("Webhook handler failed:", err.message);
    return new NextResponse("Webhook handler error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
