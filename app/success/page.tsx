export default function SuccessPage({
  searchParams,
}: {
  searchParams?: { b?: string };
}) {
  const back = searchParams?.b ? `/business/${searchParams.b}` : "/";
  return (
    <main className="max-w-2xl mx-auto p-8">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-green-700">Payment successful 🎉</h1>
        <p className="mt-2 text-gray-700">
          Your deposit was received. We’ll be in touch with confirmation details.
        </p>
        <a
          href={back}
          className="inline-block mt-6 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"
        >
          Back to booking page
        </a>
      </div>
    </main>
  );
}
