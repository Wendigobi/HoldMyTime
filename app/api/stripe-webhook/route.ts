// app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Stripe from "stripe";

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
    const payload = await req.text(); // raw body
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message);
    return NextResponse.json(
      { error: `Webhook verification failed: ${err?.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const meta = session.metadata ?? {};
        const amount =
          typeof session.amount_total === "number" ? session.amount_total : null;

        // Upsert booking using the session id as unique key
        const { error } = await supabaseAdmin
          .from("bookings")
          .upsert(
            {
              stripe_session_id: session.id,
              business_id: meta.business_id ?? null,
              name: meta.name ?? null,
              email: session.customer_details?.email ?? meta.email ?? null,
              phone: meta.phone ?? null,
              address: meta.address ?? null,
              service: meta.service ?? null,
              date: meta.date ?? null,
              time: meta.time ?? null,
              notes: meta.notes ?? null,
              status: "confirmed",
              deposit_paid: true,
              deposit_cents: amount,
            },
            { onConflict: "stripe_session_id" }
          );

        if (error) throw error;

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;

        const { error } = await supabaseAdmin
          .from("bookings")
          .update({ status: "expired" })
          .eq("stripe_session_id", session.id);

        if (error) throw error;

        break;
      }

      default:
        // Other events can be added later
        break;
    }

    return new Response(null, { status: 200 });
  } catch (err: any) {
    console.error("Webhook handler error:", err?.message ?? err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
