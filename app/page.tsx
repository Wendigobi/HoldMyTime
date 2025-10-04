import Link from 'next/link';
import AuthGate from '@/components/AuthGate';
import CreatePageForm from '@/components/CreatePageForm';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <AuthGate
        signedOut={
          <div className="centered-layout">
            <div className="container max-w-6xl">
              <div className="text-center mb-16">
                <h1 className="text-6xl md:text-7xl font-extrabold mb-6">
                  HoldMyTime
                </h1>
                <p className="text-2xl md:text-3xl text-secondary mb-8 max-w-3xl mx-auto">
                  Instant booking with paid deposits
                </p>
                <p className="text-xl text-muted max-w-2xl mx-auto mb-12">
                  Crush no-shows, keep your calendar full, and get paid upfront. Perfect for contractors, cleaners, and service businesses.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/login" className="btn text-lg px-8 py-4">
                    Get started free
                  </Link>
                  <Link href="/login" className="btn-outline text-lg px-8 py-4">
                    Sign in
                  </Link>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-16">
                <div className="card text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gold">Pick Your Deposit</h3>
                  <p className="text-secondary">Choose $25, $50, $75, or $100 deposit per booking</p>
                </div>

                <div className="card text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gold">Share Your Link</h3>
                  <p className="text-secondary">Get a custom booking page to share with customers</p>
                </div>

                <div className="card text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gold">Get Real Bookings</h3>
                  <p className="text-secondary">Customers pay deposit via Stripe, you get notified</p>
                </div>
              </div>

              <div className="card-gold text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">Stop losing money to no-shows</h2>
                <p className="text-lg text-secondary mb-6">
                  Join service businesses already using HoldMyTime to secure their bookings
                </p>
                <Link href="/login" className="btn text-lg px-8 py-4">
                  Create your booking page
                </Link>
              </div>
            </div>
          </div>
        }
        signedIn={
          <div className="min-h-screen py-12">
            <div className="container max-w-4xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Create Booking Page</h1>
                  <p className="text-secondary">Set up a new page for your business</p>
                </div>
                <Link href="/dashboard" className="btn-outline">
                  View Dashboard
                </Link>
              </div>

              <CreatePageForm />
            </div>
          </div>
        }
      />
    </div>
  );
}
