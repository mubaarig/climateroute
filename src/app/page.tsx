'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SearchPanel from '@/components/Search/SearchPanel';
import RouteResults from '@/components/Results/RouteResults';
import CarbonBudget from '@/components/CarbonBudget/CarbonBudget';
import { useRouteStore } from '@/store/useRouteStore';
import { registerServiceWorker } from '@/utils/serviceWorker';
import L from 'leaflet';

// Dynamically import map components
const MapComponent = dynamic(() => import('@/components/Map/MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
});

const RouteLayer = dynamic(() => import('@/components/Map/RouteLayer'), {
  ssr: false
});

export default function Home() {
  const [map, setMap] = useState<L.Map | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { 
    routes, 
    selectedRoute, 
    isLoading, 
    calculateRoute, 
    setSelectedRoute 
  } = useRouteStore();

  useEffect(() => {
    setIsClient(true);
    // Register service worker for PWA functionality
    registerServiceWorker();
  }, []);

  const handleMapLoad = (mapInstance: L.Map) => {
    setMap(mapInstance);
  };

  const handleRouteCalculate = async (origin: string, destination: string) => {
    await calculateRoute(origin, destination);
  };

  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ClimateRoute...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-96 bg-gray-50 p-4 overflow-y-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">🌱 ClimateRoute</h1>
          <p className="text-gray-600 text-sm">Eco-friendly travel planning</p>
        </div>
        
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
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-700">Calculating eco-friendly routes...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}