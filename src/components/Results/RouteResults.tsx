'use client';

import { useState } from 'react';
import { RouteOption, RouteTag } from '@/types/route';
import { SCORE_EXPLANATION } from '@/utils/climateCalculator';
import { Leaf, Clock, Route as RouteIcon, Info, Zap, TimerReset, CircleHelp } from 'lucide-react';

interface RouteResultsProps {
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  onRouteSelect: (route: RouteOption) => void;
}

const formatDistance = (meters: number) => `${(meters / 1000).toFixed(1)} km`;
const formatDuration = (seconds: number) => `${Math.round(seconds / 60)} min`;
const formatCo2 = (kg: number) => `${kg.toFixed(2)} kg CO₂e`;

const TAG_STYLES: Record<RouteTag, string> = {
  greenest: 'bg-green-100 text-green-800',
  fastest: 'bg-blue-100 text-blue-800',
  shortest: 'bg-amber-100 text-amber-800',
};

function TradeOff({ routes }: { routes: RouteOption[] }) {
  const greenest = routes.find((r) => r.tags.includes('greenest'));
  const fastest = routes.find((r) => r.tags.includes('fastest'));
  if (!greenest || !fastest || greenest.id === fastest.id) return null;

  const extraMinutes = Math.round((greenest.duration - fastest.duration) / 60);
  const savedKg = fastest.emissionsKg - greenest.emissionsKg;
  if (extraMinutes <= 0 || savedKg <= 0) return null;

  return (
    <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-100 p-3 text-sm text-green-800">
      <TimerReset className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
      <span>
        Choosing the greenest route adds <strong>{extraMinutes} min</strong> but saves{' '}
        <strong>{savedKg.toFixed(2)} kg CO₂e</strong> over the fastest route.
      </span>
    </div>
  );
}

export default function RouteResults({ routes, selectedRoute, onRouteSelect }: RouteResultsProps) {
  const [showExplain, setShowExplain] = useState(false);
  if (routes.length === 0) return null;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <RouteIcon className="h-4 w-4 mr-2 text-green-600" aria-hidden />
          {routes.length === 1 ? '1 route' : `${routes.length} routes compared`}
        </h3>
        <button
          type="button"
          onClick={() => setShowExplain((v) => !v)}
          aria-expanded={showExplain}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
        >
          <CircleHelp className="h-3.5 w-3.5" aria-hidden />
          How the score works
        </button>
      </div>

      {showExplain && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">{SCORE_EXPLANATION}</p>
      )}

      <TradeOff routes={routes} />

      <ul className="space-y-3">
        {routes.map((route) => {
          const isSelected = selectedRoute?.id === route.id;
          return (
            <li key={route.id}>
              <button
                type="button"
                onClick={() => onRouteSelect(route)}
                aria-pressed={isSelected}
                className={`w-full text-left border rounded-lg p-4 transition-all ${
                  isSelected
                    ? 'border-green-500 bg-green-50 ring-1 ring-green-200'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-medium text-gray-900">{route.label}</span>
                    {route.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded ${TAG_STYLES[tag]}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="flex items-center bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold shrink-0">
                    <Leaf className="h-3.5 w-3.5 mr-1" aria-hidden />
                    {route.climateScore}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" aria-hidden />
                    {formatDuration(route.duration)}
                  </span>
                  <span className="flex items-center">
                    <RouteIcon className="h-4 w-4 mr-1" aria-hidden />
                    {formatDistance(route.distance)}
                  </span>
                  <span className="flex items-center">
                    <Zap className="h-4 w-4 mr-1" aria-hidden />
                    {formatCo2(route.emissionsKg)}
                  </span>
                </div>

                <ul className="space-y-0.5">
                  {route.reasons.map((reason) => (
                    <li key={reason} className="flex items-start text-xs text-gray-500">
                      <span className="text-green-500 mr-1.5" aria-hidden>
                        ✓
                      </span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="flex items-start gap-1.5 text-[11px] text-gray-400">
        <Info className="h-3.5 w-3.5 mt-px shrink-0" aria-hidden />
        Traffic data unavailable — score based on emissions, distance, elevation and weather.
      </p>
    </section>
  );
}
