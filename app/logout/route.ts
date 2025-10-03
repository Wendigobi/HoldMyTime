// /app/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: Request) {
  const cookieStore = cookies();

  // Create a server client and wire cookie get/set/remove
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
          // Clear by setting maxAge=0
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  await supabase.auth.signOut();

  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  return NextResponse.redirect(new URL('/login', base), { status: 302 });
}
