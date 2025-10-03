import Link from 'next/link';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function Dashboard() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user's businesses
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_user', user?.id ?? 'none')
    .order('created_at', { ascending: false });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your booking pages</h1>
        <Link href="/" className="btn-ghost">Create another</Link>
      </div>

      {!businesses?.length && (
        <div className="card p-6">
          <p className="text-zinc-400">No pages yet. Create one on the home page.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {businesses?.map((b) => (
          <div key={b.id} className="card p-5">
            <h3 className="text-lg font-semibold">{b.name}</h3>
            <p className="text-sm text-zinc-400">Deposit: ${b.deposit}</p>
            <p className="text-sm text-zinc-400">Slug: <span className="text-zinc-200">{b.slug}</span></p>
            <div className="mt-4 flex gap-3">
              <Link href={`/business/${b.slug}`} className="btn-gold">View public page</Link>
              {/* Add more actions later (edit, delete, stats) */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
