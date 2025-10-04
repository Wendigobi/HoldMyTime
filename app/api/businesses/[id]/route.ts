// app/api/businesses/[id]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Ensure Node runtime so Supabase cookie helpers work consistently
export const runtime = 'nodejs';

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing business id' }, { status: 400 });
  }

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
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // no-op: the API still works even if we can't set cookies here
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          } catch {
            // no-op
          }
        },
      },
    }
  );

  // Auth check
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // If you DON'T have ON DELETE CASCADE on dependent tables,
  // uncomment these explicit deletes first:
  //
  // await supabase.from('bookings').delete().eq('business_id', id);
  // await supabase.from('pages').delete().eq('business_id', id);
  // ...add any other child tables that reference businesses.id

  // Delete only if the business belongs to the current user
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
