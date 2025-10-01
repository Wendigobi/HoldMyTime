import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Body = {
  slug: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  address?: string;
  service?: string;
  date?: string;
  time?: string;
  notes?: string;
  deposit_cents: number; // integer cents
};

// Compute base URL for success/cancel
function getBaseUrl(reqOrigin?: string | null) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    reqOrigin ||
    "http://localhost:3000"
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const {
      slug,
      customer_name = "",
      customer_email = "",
      customer_phone = "",
      address = "",
      service = "",
      date = "",
      time = "",
      notes = "",
      deposit_cents,
    } = body;

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    if (!deposit_cents || Number.isNaN(deposit_cents) || deposit_cents <= 0) {
      return NextResponse.json(
        { error: "Invalid deposit amount" },
        { status: 400 }
      );
    }

    // Get business by slug (server-side—no “missing business_id” UX)
    const { data: business, error: bizErr } = await supabaseAdmin
      .from("businesses")
      .select("id, name, slug")
      .eq("slug", slug)
      .single();

    if (bizErr || !business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const origin = headers().get("origin");
    const baseUrl = getBaseUrl(origin);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customer_email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: deposit_cents, // ✅ integer cents from client
            product_data: {
              name: `${business.name} — Booking Deposit`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?b=${encodeURIComponent(business.slug)}`,
      cancel_url: `${baseUrl}/business/${encodeURIComponent(
        business.slug
      )}?canceled=1`,
      metadata: {
        business_id: String(business.id),
        business_slug: business.slug,
        customer_name,
        customer_email,
        customer_phone,
        address,
        service,
        date,
        time,
        notes,
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Create session error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
