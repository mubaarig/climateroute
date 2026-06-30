'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { WifiOff } from 'lucide-react';
import L from 'leaflet';

import SearchPanel from '@/components/Search/SearchPanel';
import RouteResults from '@/components/Results/RouteResults';
import CarbonBudget from '@/components/CarbonBudget/CarbonBudget';
import EmptyState from '@/components/EmptyState';
import MapLegend from '@/components/Map/MapLegend';
import { useRouteStore } from '@/store/useRouteStore';
import { useRouteSearch } from '@/hooks/useRouteSearch';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { registerServiceWorker } from '@/utils/serviceWorker';
import { RouteError, PlanStep } from '@/lib/planRoutes';
import { RouteOption, RoutePreference } from '@/types/route';

const MapComponent = dynamic(() => import('@/components/Map/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
      Loading map…
    </div>
  ),
});

const RouteLayer = dynamic(() => import('@/components/Map/RouteLayer'), { ssr: false });

const STEP_LABELS: Record<PlanStep, string> = {
  geocoding: 'Geocoding addresses…',
  routing: 'Calculating route alternatives…',
  enriching: 'Estimating elevation & weather…',
  scoring: 'Ranking greenest route…',
};

function pickRecommended(routes: RouteOption[], preference: RoutePreference): RouteOption {
  if (preference === 'fastest') {
    return routes.find((r) => r.tags.includes('fastest')) ?? routes[0];
  }
  // greenest / balanced — routes are already sorted greenest-first.
  return routes[0];
}

function errorMessage(error: Error | null): string | null {
  if (!error) return null;
  if (error instanceof RouteError) return error.message;
  return 'Something went wrong while planning the route. Please try again.';
}

export default function Home() {
  const [map, setMap] = useState<L.Map | null>(null);
  const {
    vehicle,
    preference,
    selectedRouteId,
    loadingStep,
    setVehicle,
    setPreference,
    setSelectedRouteId,
  } = useRouteStore();

  const online = useOnlineStatus();
  const search = useRouteSearch();
  const routes = search.data?.routes ?? [];
  const selectedRoute = routes.find((r) => r.id === selectedRouteId) ?? routes[0] ?? null;

  useEffect(() => {
    registerServiceWorker();
  }, []);

  // When a new plan arrives, select the route matching the user's priority.
  useEffect(() => {
    if (search.data && search.data.routes.length > 0) {
      setSelectedRouteId(pickRecommended(search.data.routes, search.data.preference).id);
    }
  }, [search.data, setSelectedRouteId]);

  const handleSubmit = (origin: string, destination: string) => {
    search.mutate({ origin, destination, vehicle, preference });
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row">
      {/* Control panel */}
      <aside className="w-full lg:w-[400px] lg:h-screen bg-gray-50 border-r border-gray-200 overflow-y-auto">
        <header className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
          <Image src="/logo.png" width={36} height={36} alt="" className="h-9 w-9 object-contain" />
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">ClimateRoute</p>
            <p className="text-xs text-gray-500 leading-tight">Green route planner</p>
          </div>
        </header>

        <div className="p-4 space-y-4">
          {!online && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
              <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
              You are offline. Live route search is paused until you reconnect.
            </div>
          )}

          <SearchPanel
            vehicle={vehicle}
            preference={preference}
            onVehicleChange={setVehicle}
            onPreferenceChange={setPreference}
            onSubmit={handleSubmit}
            isLoading={search.isPending}
            disabled={!online}
            errorMessage={errorMessage(search.error)}
          />

          {!search.data && !search.isPending && <EmptyState />}

          {selectedRoute && (
            <>
              <RouteResults
                routes={routes}
                selectedRoute={selectedRoute}
                onRouteSelect={(route) => setSelectedRouteId(route.id)}
              />
              <CarbonBudget route={selectedRoute} vehicle={vehicle} />
            </>
          )}
        </div>
      </aside>

      {/* Map */}
      <main className="flex-1 relative min-h-[50vh]">
        <MapComponent onMapLoad={setMap}>
          {map && routes.length > 0 && (
            <RouteLayer
              routes={routes}
              selectedRoute={selectedRoute}
              onRouteSelect={(route) => setSelectedRouteId(route.id)}
            />
          )}
        </MapComponent>

        {routes.length > 0 && <MapLegend />}

        {search.isPending && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-[1000]">
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4" />
              <p className="text-sm text-gray-700">
                {loadingStep ? STEP_LABELS[loadingStep] : 'Planning your route…'}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
