// app/business/[slug]/page.tsx
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';

export const runtime = 'nodejs';

type Props = { params: { slug: string } };

export default async function PublicBusinessPage({ params }: Props) {
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

  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle();

  if (error || !business) {
    return (
      <main className="grid min-h-screen place-items-center px-6 py-12">
        <div className="rounded-2xl border border-amber-500/25 bg-black/40 p-6 text-amber-200 backdrop-blur">
          <p>We couldn’t find this booking page.</p>
        </div>
      </main>
    );
  }

  const deposit = (business.deposit_cents ?? 0) / 100;
  const payLink = business.stripe_pay_link_url as string | null;

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="rounded-3xl border border-amber-500/25 bg-black/40 p-6 shadow-[0_8px_40px_rgba(255,200,0,0.08)] backdrop-blur">
          <h1 className="text-3xl font-bold text-amber-300">{business.business_name}</h1>
          <p className="mt-1 text-amber-200/80">
            Deposit required: <span className="font-semibold text-amber-200">${deposit.toFixed(0)}</span>
          </p>
        </header>

        <section className="rounded-2xl border border-amber-500/20 bg-black/40 p-6 backdrop-blur">
          <h2 className="mb-3 text-xl font-semibold text-amber-300">Book an appointment</h2>
          <p className="mb-4 text-amber-200/85">
            Pay a small deposit to hold your time. You’ll get an email/text confirmation from the business.
          </p>
          {payLink ? (
            <a
              href={payLink}
              className="inline-block rounded-xl bg-amber-500 px-5 py-2.5 font-medium text-black hover:bg-amber-400"
            >
              Book now
            </a>
          ) : (
            <div className="rounded-xl border border-amber-500/30 bg-black/50 p-4 text-amber-200/80">
              <p className="mb-2">The business hasn’t linked a Stripe Pay Link yet.</p>
              <p className="text-sm">
                Owner: add <code className="rounded bg-black/60 px-1">stripe_pay_link_url</code> for this page in the
                <Link href="/dashboard" className="underline"> dashboard</Link>.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
