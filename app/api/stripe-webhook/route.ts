// app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";              // <- use central client
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

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
    const payload = await req.text(); // raw body in app router
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    // If you stored stripe_session_id when creating the session
    const stripeSessionId = session.id as string | undefined;
    if (stripeSessionId) {
      const findRes = await supabaseAdmin
        .from("bookings")
        .select("id,business_id")
        .eq("stripe_session_id", stripeSessionId)
        .maybeSingle();

      if (findRes.error) {
        console.error("DB lookup error:", findRes.error);
      }

      if (findRes.data?.id) {
        await supabaseAdmin
          .from("bookings")
          .update({ status: "paid" })
          .eq("id", findRes.data.id);
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
