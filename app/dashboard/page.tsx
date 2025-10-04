// app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';

export default async function Dashboard() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {}
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // middleware also protects this, but this is a safe fallback
    return (
      <main className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <p className="text-amber-200">
            You’re signed out. <Link href="/login" className="underline">Sign in</Link>.
          </p>
        </div>
      </main>
    );
  }

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-amber-300">Dashboard</h1>
          <Link
            href="/"
            className="rounded-md border border-amber-500/40 bg-black px-3 py-1.5 text-amber-300 hover:bg-amber-500/10"
          >
            Create new booking page
          </Link>
        </header>

        {error && <p className="text-red-400">{error.message}</p>}

        {!businesses?.length ? (
          <p className="text-amber-200/80">
            No booking pages yet. Click <span className="font-medium">“Create new booking page”</span> to start.
          </p>
        ) : (
          <ul className="grid gap-4">
            {businesses.map((b: any) => (
              <li key={b.id} className="rounded-xl border border-amber-500/20 bg-black/40 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-medium text-amber-100">{b.business_name}</div>
                    <div className="text-sm text-amber-200/70">
                      Deposit: ${(b.deposit_cents / 100).toFixed(0)} · {b.contact_email} · {b.phone}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* Replace with the real public URL for the page */}
                    {/* <Link href={`/business/${b.slug}`} className="text-amber-300 hover:underline">View</Link> */}
                    <Link href={`/business/${b.slug ?? b.id}`} className="text-amber-300 hover:underline">
                      Preview
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
