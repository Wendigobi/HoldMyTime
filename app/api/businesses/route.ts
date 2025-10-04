// app/api/businesses/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: Request) {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  // server-side auth check
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // parse form body (we purposely expect form fields)
  const form = await req.formData();
  const owner_email = String(form.get('owner_email') ?? '');
  const business_name = String(form.get('business_name') ?? '');
  const phone = String(form.get('phone') ?? '');
  const contact_email = String(form.get('contact_email') ?? '');
  const deposit = String(form.get('deposit') ?? '$25'); // "$25", "$50", "$75", "$100"

  if (!owner_email || !business_name || !phone || !contact_email || !deposit) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  // normalize deposit → cents
  const cents = Number((deposit || '').replace('$', '')) * 100;
  if (![2500, 5000, 7500, 10000].includes(cents)) {
    return NextResponse.json({ error: 'Invalid deposit.' }, { status: 400 });
  }

  // write to DB; RLS should require owner_user = auth.uid()
  const { data, error } = await supabase
    .from('businesses')
    .insert({
      owner_id: user.id,        // <-- important
      owner_email,
      business_name,
      phone,
      contact_email,
      deposit_cents: cents,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, business: data }, { status: 201 });
}
