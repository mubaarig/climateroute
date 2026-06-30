import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Offline | ClimateRoute',
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-3xl font-semibold mb-4">You&apos;re Offline</h1>
      <p className="max-w-md text-slate-300 mb-6">
        We can&apos;t reach the ClimateRoute services right now. Once you&apos;re back online,
        refresh this page to continue planning greener journeys.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-3 font-medium text-slate-900 hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
      >
        Retry
      </Link>
    </main>
  );
}
