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
        remove() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  // middleware should have redirected if no user
  if (!user) return null;

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, business_name, deposit_cents, contact_email, phone')
    .order('created_at', { ascending: false });

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Your booking pages</h1>
        <form action="/logout" method="post">
          <button className="px-3 py-2 rounded bg-amber-500 text-black hover:bg-amber-400">Sign out</button>
        </form>
      </div>

      {error && <p className="text-red-500">{error.message}</p>}

      {!businesses?.length ? (
        <p className="text-gray-400">No pages yet. Create one on the home page.</p>
      ) : (
        <ul className="grid gap-3">
          {businesses.map((b) => (
            <li key={b.id} className="rounded border border-gray-700 bg-black/40 p-4">
              <div className="font-medium text-lg">{b.business_name}</div>
              <div className="text-sm text-gray-400">
                Deposit: ${(b.deposit_cents / 100).toFixed(0)} &middot; {b.contact_email} &middot; {b.phone}
              </div>
              {/* Insert your public booking url once that page exists */}
              {/* <Link href={`/book/${b.id}`} className="text-amber-400 hover:underline">Open public page</Link> */}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
