import { Suspense } from 'react';
import CallbackClient from './CallbackClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

function LoadingState() {
  return (
    <div className="centered-layout">
      <div className="card-gold text-center max-w-md">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-xl text-gold font-semibold">Loading...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CallbackClient />
    </Suspense>
  );
}
