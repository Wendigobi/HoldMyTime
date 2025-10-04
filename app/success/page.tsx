export default function SuccessPage({
  searchParams,
}: {
  searchParams?: { b?: string };
}) {
  const back = searchParams?.b ? `/business/${searchParams.b}` : "/";

  return (
    <main className="centered-layout">
      <div className="card-gold max-w-2xl text-center">
        <div className="mb-6">
          <svg className="mx-auto h-20 w-20 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="mb-4 text-4xl font-bold">Payment Successful!</h1>

        <p className="mb-6 text-lg text-secondary">
          Your deposit has been received successfully. We'll send you a confirmation email shortly with all the details.
        </p>

        <div className="mb-8 rounded-lg bg-black/50 p-4">
          <p className="text-sm text-muted">
            <strong className="text-gold">What's Next?</strong>
          </p>
          <p className="mt-2 text-sm text-secondary">
            The business will confirm your appointment and reach out to you with additional details.
            Check your email for your receipt and booking information.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href={back} className="btn">
            Back to Booking Page
          </a>
          <a href="/" className="btn-outline">
            Go Home
          </a>
        </div>
      </div>
    </main>
  );
}
