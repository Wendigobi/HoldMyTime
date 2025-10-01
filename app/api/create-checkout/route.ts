// app/api/create-checkout/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Expect these from your booking form
    const {
      businessId,
      slug,           // optional: where to send user back if they cancel
      name,
      email,
      phone,
      address,
      service,
      date,
      time,
      notes,
      amountCents,    // Deposit in cents (e.g., 5000 = $50)
    } = body;

    if (!amountCents || !businessId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: { name: "Booking Deposit" },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/business/${slug ?? "booking"}`,
      metadata: {
        business_id: String(businessId),
        name: name ?? "",
        email: email ?? "",
        phone: phone ?? "",
        address: address ?? "",
        service: service ?? "",
        date: date ?? "",
        time: time ?? "",
        notes: notes ?? "",
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err: any) {
    console.error("create-checkout error:", err);
    return NextResponse.json({ error: err?.message ?? "Error" }, { status: 500 });
  }
}
