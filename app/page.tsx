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
              <div className="text-center mb-16 animate-fadeIn">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-6 px-4">
                  HoldMyTime
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl text-secondary mb-8 max-w-3xl mx-auto px-4">
                  Never lose money to no-shows again
                </p>
                <p className="text-base sm:text-xl text-muted max-w-3xl mx-auto mb-8 leading-relaxed px-4">
                  The modern booking solution for salons, barbershops, tattoo artists, plumbers, contractors, freelancers, and service professionals who value their time.
                </p>
                <div className="bg-gold/10 border border-gold/30 rounded-2xl p-4 sm:p-6 max-w-2xl mx-4 sm:mx-auto mb-12">
                  <p className="text-xl sm:text-2xl font-bold text-gold mb-2">Only $15/month</p>
                  <p className="text-sm sm:text-base text-secondary">Unlimited booking pages • Secure deposits • Professional dashboard</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                  <Link href="/login" className="btn text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                    Start Your Free Trial
                  </Link>
                  <Link href="/login" className="btn-outline text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
                    Sign In
                  </Link>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-16">
                <div className="card text-center animate-slideUp" style={{ animationDelay: '0.2s' }}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gold">Set Your Deposit</h3>
                  <p className="text-secondary">Choose $25, $50, $75, or $100 deposit to secure each booking</p>
                </div>

                <div className="card text-center animate-slideUp" style={{ animationDelay: '0.3s' }}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gold">Share Your Link</h3>
                  <p className="text-secondary">Get a professional booking page with your custom URL</p>
                </div>

                <div className="card text-center animate-slideUp" style={{ animationDelay: '0.4s' }}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gold">Get Paid Upfront</h3>
                  <p className="text-secondary">Secure payment via Stripe. Real commitments, zero no-shows</p>
                </div>
              </div>

              <div className="card-gold text-center max-w-3xl mx-auto animate-slideUp" style={{ animationDelay: '0.5s' }}>
                <h2 className="text-3xl font-bold mb-4">Perfect for Every Service Business</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-left mb-8">
                  <div className="flex items-start gap-3">
                    <span className="text-gold text-2xl">💇</span>
                    <div>
                      <p className="font-semibold text-gold">Salons & Barbers</p>
                      <p className="text-sm text-secondary">Lock in appointments, cut no-shows</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-gold text-2xl">🎨</span>
                    <div>
                      <p className="font-semibold text-gold">Tattoo Artists</p>
                      <p className="text-sm text-secondary">Secure time slots with deposits</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-gold text-2xl">🔧</span>
                    <div>
                      <p className="font-semibold text-gold">Plumbers & Contractors</p>
                      <p className="text-sm text-secondary">Get commitment before the drive</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-gold text-2xl">💼</span>
                    <div>
                      <p className="font-semibold text-gold">Freelancers & Consultants</p>
                      <p className="text-sm text-secondary">Respect your time, get paid first</p>
                    </div>
                  </div>
                </div>
                <Link href="/login" className="btn text-lg px-8 py-4">
                  Start Free Trial — $15/month after
                </Link>
              </div>

              <footer className="mt-16 text-center text-sm text-muted">
                <Link href="/privacy" className="hover:text-gold transition-colors">
                  Privacy Policy
                </Link>
              </footer>
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
