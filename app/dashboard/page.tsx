import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import getSupabaseAdmin from '@/lib/supabaseAdmin'

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard')

  const admin = getSupabaseAdmin()
  const { data: businesses, error } = await admin
    .from('businesses')
    .select('id,name,slug,deposit_cents,created_at')
    .eq('owner_email', user.email)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-semibold text-gold mb-6">Your Booking Pages</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {(businesses ?? []).map((b) => (
          <div key={b.id} className="rounded-xl border border-gold/20 bg-card p-4">
            <div className="text-xl font-medium">{b.name}</div>
            <div className="text-sm text-muted">
              Deposit: ${(b.deposit_cents / 100).toFixed(0)}
            </div>
            <div className="text-sm text-muted">Slug: {b.slug}</div>
          </div>
        ))}
        {!businesses?.length && (
          <div className="text-muted">No pages yet. Create one on the homepage.</div>
        )}
      </div>
    </div>
  )
}
