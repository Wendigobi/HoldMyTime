import getSupabaseAdmin from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Ensure deposit/price_tier is numeric (no "$")
    const deposit = typeof body.deposit === 'string'
      ? parseInt(body.deposit.replace(/\D+/g, ''), 10)
      : Number(body.deposit);

    if (!Number.isFinite(deposit)) {
      return NextResponse.json({ error: 'Invalid deposit' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin(); // <-- now typed as SupabaseClient (non-null)

    const { data, error } = await supabase
      .from('bookings')
      .insert([{ ...body, deposit }])
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Server error' }, { status: 500 });
  }
}
