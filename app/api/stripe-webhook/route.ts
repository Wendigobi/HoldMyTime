// app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// No apiVersion option here – let the SDK use its own pinned version.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json(
      { error: "Missing webhook signature/secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const payload = await req.text(); // raw body in the App Router
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Optional: persist the Stripe session id if you created the column
        await supabaseAdmin
          .from("bookings")
          .update({
            status: "paid",
            stripe_session_id: session.id ?? null,
          })
          .eq("id", (session.metadata as any)?.booking_id ?? "");

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await supabaseAdmin
          .from("bookings")
          .update({ status: "expired" })
          .eq("id", (session.metadata as any)?.booking_id ?? "");
        break;
      }

      default:
        // Ignore other events for now
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: `Webhook handling error: ${e.message}` },
      { status: 500 }
    );
  }
}
