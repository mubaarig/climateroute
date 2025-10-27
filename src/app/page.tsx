'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import SearchPanel from '@/components/Search/SearchPanel';
import RouteResults from '@/components/Results/RouteResults';
import CarbonBudget from '@/components/CarbonBudget/CarbonBudget';
import { useRouteStore } from '@/store/useRouteStore';
import L from 'leaflet';

// Dynamically import map components to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/Map/MapComponent'), { 
  ssr: false 
});

const RouteLayer = dynamic(() => import('@/components/Map/RouteLayer'), {
  ssr: false
});

export default function Home() {
  const [map, setMap] = useState<L.Map | null>(null);
  const { 
    routes, 
    selectedRoute, 
    isLoading, 
    calculateRoute, 
    setSelectedRoute 
  } = useRouteStore();

  const handleMapLoad = (mapInstance: L.Map) => {
    setMap(mapInstance);
  };

  const handleRouteCalculate = async (origin: string, destination: string) => {
    await calculateRoute(origin, destination);
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-96 bg-gray-50 p-4 overflow-y-auto">
        <SearchPanel 
          onRouteCalculate={handleRouteCalculate}
          isLoading={isLoading}
        />
        
        {selectedRoute && (
          <>
            <RouteResults 
              routes={routes}
              selectedRoute={selectedRoute}
              onRouteSelect={setSelectedRoute}
            />
            <CarbonBudget 
              routeDistance={selectedRoute.distance}
              climateScore={selectedRoute.climateScore}
            />
          </>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapComponent onMapLoad={handleMapLoad}>
          {map && routes.length > 0 && (
            <RouteLayer 
              routes={routes}
              selectedRoute={selectedRoute}
              onRouteSelect={setSelectedRoute}
            />
          )}
        </MapComponent>
      </div>
    </div>
  );
}