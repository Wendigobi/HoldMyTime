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

  // First verify the business belongs to the current user
  const { data: business, error: fetchError } = await supabase
    .from('businesses')
    .select('id, owner_id')
    .eq('id', id)
    .single();

  if (fetchError || !business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  if (business.owner_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Delete related bookings first (if they exist)
  const { error: bookingsError } = await supabase
    .from('bookings')
    .delete()
    .eq('business_id', id);

  if (bookingsError) {
    console.error('Error deleting bookings:', bookingsError);
    // Continue anyway - bookings table might not exist or be empty
  }

  // Now delete the business
  const { error: deleteError } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Error deleting business:', deleteError);
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, deleted: true });
}
