// app/api/businesses/route.ts
import { NextResponse } from 'next/server';
import getSupabaseAdmin from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';        // avoid edge runtime surprises
export const dynamic = 'force-dynamic'; // API route should be dynamic

function toNumber(input: unknown): number {
  if (typeof input === 'number') return input;
  if (typeof input === 'string') {
    const n = parseInt(input.replace(/[^0-9]/g, ''), 10);
    if (Number.isFinite(n)) return n;
  }
  throw new Error('Invalid deposit');
}

export async function POST(req: Request) {
  try {
    const { owner_email, name, slug, email, phone, deposit, services } = await req.json();

    const dep = toNumber(deposit);

    const supabase = getSupabaseAdmin(); // default export (non-null)

    const { data, error } = await supabase
      .from('businesses')
      .insert([{ owner_email, name, slug, email, phone, deposit: dep, services }])
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
