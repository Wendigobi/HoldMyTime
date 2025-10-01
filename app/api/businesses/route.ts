import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const body = await req.json();
  const { owner_email, name, slug, email, phone, deposit, services } = body;

  if (!owner_email || !name || !slug || !deposit) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const dep = parseInt(deposit);
  if (![25, 50, 75, 100].includes(dep)) {
    return NextResponse.json({ error: "Deposit must be 25, 50, 75, or 100" }, { status: 400 });
  }

  const servicesArr =
    typeof services === "string" && services.length
      ? (services as string).split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  const { data, error } = await supabaseAdmin
    .from("businesses")
    .insert({ owner_email, name, slug, email, phone, deposit: dep, services: servicesArr })
    .select("slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ slug: data.slug });
}
