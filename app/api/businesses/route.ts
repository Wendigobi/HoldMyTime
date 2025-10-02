// app/api/businesses/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic validation
    const required = ["email", "name", "slug", "phone", "owner_email", "price_tier"];
    const missing = required.filter((k) => !body?.[k]);
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Server is misconfigured (Supabase env)." },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("businesses")
      .insert({
        owner_email: body.owner_email,
        name: body.name,
        slug: body.slug,
        email: body.email,
        phone: body.phone,
        deposit: body.price_tier,  // your fixed tiers
        services: body.services ?? [],
      })
      .select("slug")
      .single();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, slug: data.slug });
  } catch (err: any) {
    console.error("POST /api/businesses failed:", err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
