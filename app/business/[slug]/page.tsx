// app/business/[slug]/page.tsx
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import Link from 'next/link';
import BookingForm from './BookingForm';
import type { Business } from '../../../lib/types';

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
      <main className="centered-layout">
        <div className="card max-w-md text-center">
          <svg className="mx-auto mb-4 h-16 w-16 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mb-2 text-2xl font-bold text-gold">Page Not Found</h2>
          <p className="mb-6 text-secondary">
            We couldn't find this booking page. Please check the URL and try again.
          </p>
          <Link href="/" className="btn inline-block">
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  const businessData = business as Business;
  const deposit = (businessData.deposit_cents ?? 0) / 100;

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="container max-w-4xl">
        <header className="card-gold mb-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="mb-3 text-4xl font-bold">{businessData.business_name}</h1>
          <p className="mb-2 text-lg text-secondary">
            Secure your appointment with a <span className="font-bold text-gold">${deposit.toFixed(0)}</span> deposit
          </p>
          <p className="text-sm text-muted">
            Book your time slot and we'll confirm your appointment
          </p>
        </header>

        <div className="card">
          <h2 className="mb-4 text-2xl font-bold text-gold">Book Your Appointment</h2>
          <p className="mb-6 text-secondary">
            Fill out the form below to secure your time slot. You'll be redirected to Stripe for secure payment processing.
          </p>

          <BookingForm
            businessId={businessData.id}
            deposit={deposit}
            support={{
              phone: businessData.phone,
              email: businessData.contact_email,
            }}
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted">
            Powered by HoldMyTime • Secure payments via Stripe
          </p>
        </div>
      </div>
    </main>
  );
}
