import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <main className="min-h-[80vh] bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            <span className="text-amber-400">Your</span> Dashboard
          </h1>
          <form action="/logout" method="post">
            {/* we’ll wire the /logout route below */}
            <button className="rounded-lg bg-zinc-800 border border-amber-500/30 px-4 py-2 hover:bg-zinc-700">
              Sign out
            </button>
          </form>
        </header>

        <section className="mt-10 grid gap-6">
          <div className="rounded-2xl border border-amber-500/30 bg-zinc-900/40 p-6">
            <h2 className="text-xl font-semibold">Welcome, {user.email}</h2>
            <p className="opacity-80 mt-1">
              This is a starter dashboard. Next steps:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1 opacity-90">
              <li>Query your <code>businesses</code> table and list pages you own.</li>
              <li>Add “Create new booking page” button that posts to <code>/api/businesses</code>.</li>
              <li>Link each page to its public URL.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
