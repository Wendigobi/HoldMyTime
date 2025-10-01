// app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!;

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
    const payload = await req.text(); // raw body (allowed in app router)
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const md = (session.metadata || {}) as Record<string, string>;

      await supabaseAdmin.from("bookings").insert({
        business_id: md.business_id,
        customer_name: md.customer_name || null,
        customer_email: md.customer_email || null,
        customer_phone: md.customer_phone || null,
        address: md.address || null,
        service: md.service || null,
        date: md.date || null,
        time: md.time || null,
        notes: md.notes || null,
        deposit_cents:
          typeof session.amount_total === "number" ? session.amount_total : null,
        stripe_session_id: session.id,
        stripe_payment_intent: String(session.payment_intent || ""),
        status: "paid",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
