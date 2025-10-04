import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; error_description?: string };
}) {
  const cookieStore = cookies();
  const code = searchParams.code;
  const error = searchParams.error_description;

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error)}`);
  }

  if (code) {
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

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      redirect(`/login?error=${encodeURIComponent(exchangeError.message)}`);
    }

    redirect('/dashboard');
  }

  // No code, just redirect to dashboard
  redirect('/dashboard');
}
