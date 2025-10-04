export default function CanceledPage({
  searchParams,
}: {
  searchParams?: { b?: string };
}) {
  const back = searchParams?.b ? `/business/${searchParams.b}` : "/";

  return (
    <main className="centered-layout">
      <div className="card max-w-2xl text-center">
        <div className="mb-6">
          <svg className="mx-auto h-20 w-20 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="mb-4 text-4xl font-bold">Payment Canceled</h1>

        <p className="mb-6 text-lg text-secondary">
          No worries! Your payment was canceled and your card was not charged.
        </p>

        <div className="mb-8 rounded-lg bg-black/50 p-4">
          <p className="text-sm text-muted">
            <strong className="text-gold">What Happened?</strong>
          </p>
          <p className="mt-2 text-sm text-secondary">
            You canceled the payment process before it was completed. No charges were made to your card.
            You can try booking again whenever you're ready.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href={back} className="btn">
            Try Booking Again
          </a>
          <a href="/" className="btn-outline">
            Go Home
          </a>
        </div>
      </div>
    </main>
  );
}
