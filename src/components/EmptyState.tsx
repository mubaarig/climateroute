'use client';

import { Leaf, Route, Wind } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
        <Leaf className="h-5 w-5 text-green-600" aria-hidden />
      </div>
      <h2 className="text-sm font-semibold text-gray-900">Plan a cleaner trip</h2>
      <p className="mt-1 text-xs text-gray-500">
        Compare fastest, shortest and lowest-carbon driving routes. Enter two locations to see your
        estimated CO₂ impact.
      </p>
      <div className="mt-4 flex justify-center gap-4 text-[11px] text-gray-400">
        <span className="flex items-center gap-1">
          <Route className="h-3.5 w-3.5" aria-hidden /> Route options
        </span>
        <span className="flex items-center gap-1">
          <Wind className="h-3.5 w-3.5" aria-hidden /> Carbon estimate
        </span>
      </div>
    </div>
  );
}
