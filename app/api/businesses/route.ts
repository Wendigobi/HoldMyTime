// /app/api/businesses/route.ts
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"; // if the @ alias doesn't work, use a relative path: "../../lib/supabaseAdmin"

export async function POST(req: Request) {
  const body = await req.json();

  const {
    owner_email,
    name,
    slug,
    email,
    phone,
    deposit_cents,  // or your field name
    services,       // or your field name
  } = body;

  const supabase = getSupabaseAdmin();            // <-- CREATE THE CLIENT

  const { data, error } = await supabase          // <-- USE THE CLIENT
    .from("businesses")
    .insert([
      {
        owner_email,
        name,
        slug,
        email,
        phone,
        deposit_cents,
        services,
      },
    ])
    .select("slug")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ slug: data.slug }, { status: 200 });
}
