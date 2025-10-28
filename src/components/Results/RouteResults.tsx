'use client';
import { RouteOption } from '@/types/route';
import { Leaf, Clock, MapPin, TrendingUp } from 'lucide-react';

interface RouteResultsProps {
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  onRouteSelect: (route: RouteOption) => void;
}

export default function RouteResults({ routes, selectedRoute, onRouteSelect }: RouteResultsProps) {
  if (routes.length === 0) return null;

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(1) + ' km';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <MapPin className="h-5 w-5 mr-2 text-green-600" />
        Route Options
      </h3>

      <div className="space-y-3">
        {routes.map((route) => (
          <div
            key={route.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedRoute?.id === route.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            }`}
            onClick={() => onRouteSelect(route)}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">{route.name}</h4>
              <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                <Leaf className="h-4 w-4 mr-1" />
                {route.climateScore}%
              </div>
            </div>

            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatDuration(route.duration)}
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                {formatDistance(route.distance)}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              CO₂ Savings: <span className="font-medium">{route.co2Savings.toFixed(2)} kg</span>
            </div>

            <div className="mt-2 flex space-x-2">
              {Object.entries(route.factors).map(([key, value]) => (
                <div
                  key={key}
                  className={`text-xs px-2 py-1 rounded-full ${
                    value === 'low' || value === 'favorable'
                      ? 'bg-green-100 text-green-800'
                      : value === 'high' || value === 'unfavorable'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {key}: {value}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
