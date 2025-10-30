'use client';
import { useState } from 'react';
import { Search, Navigation, MapPin } from 'lucide-react';

interface SearchPanelProps {
  onRouteCalculate: (origin: string, destination: string) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export default function SearchPanel({
  onRouteCalculate,
  isLoading,
  errorMessage,
}: SearchPanelProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination) {
      onRouteCalculate(origin, destination);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Plan Your Climate-Friendly Route</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Starting point..."
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <Navigation className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destination..."
            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !origin || !destination}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <Search className="h-5 w-5 mr-2" />
          {isLoading ? 'Calculating...' : 'Find Green Route'}
        </button>
      </form>

      {errorMessage && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
