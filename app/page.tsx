import AuthGate from '@/components/AuthGate';

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10 text-white">
      {/* Hero */}
      <section className="grid md:grid-cols-2 gap-10 items-start">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Book more jobs in 24h — with a deposit.
          </h1>
          <p className="mt-4 text-gray-300">
            Create a booking page with a fixed deposit ($25, $50, $75, or $100).
            Share it, get paid, get confirmations.
          </p>
        </div>

        {/* Gated Form */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Create your booking page</h2>

          <AuthGate
            signedOut={
              <div className="rounded-lg border border-gray-700 bg-black/40 p-6">
                <p className="mb-4">Sign in to create your booking page.</p>
                <form action="/login" method="get">
                  <button className="px-4 py-2 rounded bg-amber-500 text-black font-medium hover:bg-amber-400">
                    Sign in
                  </button>
                </form>
              </div>
            }
          >
            <form
              action="/api/businesses"
              method="post"
              encType="multipart/form-data"
              className="grid gap-3 rounded-lg border border-gray-700 bg-black/40 p-6"
            >
              <input
                name="owner_email"
                type="email"
                placeholder="your@email.com"
                required
                className="w-full rounded bg-black/60 border border-gray-700 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                name="business_name"
                type="text"
                placeholder="Business name"
                required
                className="w-full rounded bg-black/60 border border-gray-700 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                name="phone"
                type="tel"
                placeholder="Phone"
                required
                className="w-full rounded bg-black/60 border border-gray-700 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <input
                name="contact_email"
                type="email"
                placeholder="Contact email"
                required
                className="w-full rounded bg-black/60 border border-gray-700 px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <select
                name="deposit"
                className="w-full rounded bg-black/60 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option>$25</option>
                <option>$50</option>
                <option>$75</option>
                <option>$100</option>
              </select>

              <button className="mt-2 px-4 py-2 rounded bg-amber-500 text-black font-medium hover:bg-amber-400">
                Create page
              </button>
            </form>
          </AuthGate>
        </div>
      </section>
    </main>
  );
}
