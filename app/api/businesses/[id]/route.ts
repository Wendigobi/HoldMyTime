// app/api/businesses/[id]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Await params for Next.js 15+ compatibility
  const { id } = await context.params;
  
  console.log('[DELETE] Starting delete for business ID:', id);
  
  if (!id) {
    console.error('[DELETE] Missing business ID');
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
            // no-op
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
    console.error('[DELETE] Auth error:', userErr);
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  console.log('[DELETE] User authenticated:', user.id);

  // First verify the business belongs to the current user
  const { data: business, error: fetchError } = await supabase
    .from('businesses')
    .select('id, owner_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('[DELETE] Fetch error:', fetchError);
    return NextResponse.json({ error: 'Business not found: ' + fetchError.message }, { status: 404 });
  }

  if (!business) {
    console.error('[DELETE] Business not found');
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  if (business.owner_id !== user.id) {
    console.error('[DELETE] Unauthorized: business owner_id', business.owner_id, 'user id', user.id);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  console.log('[DELETE] Business verified, deleting bookings...');

  // Delete related bookings first
  const { error: bookingsError, count } = await supabase
    .from('bookings')
    .delete()
    .eq('business_id', id);

  if (bookingsError) {
    console.error('[DELETE] Bookings delete error:', bookingsError);
  } else {
    console.log('[DELETE] Deleted bookings count:', count);
  }

  console.log('[DELETE] Deleting business...');

  // Now delete the business
  const { error: deleteError, data: deleteData } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id)
    .select();

  if (deleteError) {
    console.error('[DELETE] Business delete error:', deleteError);
    return NextResponse.json({ 
      error: 'Failed to delete business: ' + deleteError.message,
      details: deleteError 
    }, { status: 400 });
  }

  console.log('[DELETE] Business deleted successfully:', deleteData);

  return NextResponse.json({ 
    ok: true, 
    deleted: true,
    message: 'Business and related bookings deleted successfully' 
  });
}
