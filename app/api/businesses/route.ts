// /app/api/businesses/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic'; // avoid route being statically optimized
export const runtime = 'nodejs';

function parseDollarsToCents(input: unknown): number | null {
  if (typeof input !== 'string' && typeof input !== 'number') return null;
  const s = String(input).replace(/[^0-9.]/g, '');
  const n = Number(s);
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100);
}

export async function POST(req: Request) {
  try {
    // Read text first so we can throw informative errors if it isn't JSON
    const raw = await req.text();
    const body = raw ? JSON.parse(raw) : {};

    // Pull out expected fields
    const {
      email,
      name,
      slug,
      phone,
      support_email,
      deposit,                  // optional: "$25" or 25
      deposit_cents,            // or pass cents directly
      services = [],
      test_mode = true,
    } = body;

    if (!email || !name || !slug) {
      return NextResponse.json(
        { ok: false, message: 'Missing required fields: email, name, slug' },
        { status: 400 }
      );
    }

    // Work out cents from either "deposit" ($25 -> 2500) or "deposit_cents"
    const cents =
      typeof deposit_cents === 'number'
        ? deposit_cents
        : parseDollarsToCents(deposit ?? '');

    if (cents == null) {
      return NextResponse.json(
        { ok: false, message: 'Invalid deposit amount' },
        { status: 400 }
      );
    }

    // Convert services array to a comma-separated string
    const servicesCsv = Array.isArray(services) ? services.join(',') : String(services ?? '');

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        owner_email: email,
        name,
        slug,
        phone,
        support_email: support_email ?? email,
        deposit_cents: cents,
        services: servicesCsv,
        test_mode: !!test_mode,
      })
      .select('id, slug')
      .single();

    if (error) throw error;

    return NextResponse.json(
      { ok: true, id: data.id, slug: data.slug },
      { status: 201 }
    );
  } catch (err: any) {
    // Always return JSON (prevents "Unexpected end of JSON input" in the client)
    console.error('[POST /api/businesses]', err);
    const msg =
      err?.message?.includes('JSON') && err?.stack?.includes('JSON')
        ? 'Invalid JSON body'
        : err?.message ?? 'Unknown server error';
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
