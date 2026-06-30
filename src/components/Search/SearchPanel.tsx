'use client';

import { useState } from 'react';
import { Search, Navigation, MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { RoutePreference, VehicleType } from '@/types/route';
import { VEHICLE_ORDER, VEHICLE_PROFILES } from '@/utils/emissions';
import { reverseGeocode } from '@/services/geocodingService';
import AddressAutocomplete from '@/components/Search/AddressAutocomplete';

interface SearchPanelProps {
  vehicle: VehicleType;
  preference: RoutePreference;
  onVehicleChange: (vehicle: VehicleType) => void;
  onPreferenceChange: (preference: RoutePreference) => void;
  onSubmit: (origin: string, destination: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  errorMessage?: string | null;
}

const PREFERENCES: { value: RoutePreference; label: string }[] = [
  { value: 'greenest', label: 'Greenest' },
  { value: 'fastest', label: 'Fastest' },
  { value: 'balanced', label: 'Balanced' },
];

export default function SearchPanel({
  vehicle,
  preference,
  onVehicleChange,
  onPreferenceChange,
  onSubmit,
  isLoading,
  disabled,
  errorMessage,
}: SearchPanelProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [locating, setLocating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin.trim() && destination.trim()) {
      onSubmit(origin.trim(), destination.trim());
    }
  };

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude).catch(() => null);
        setOrigin(address ?? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000 }
    );
  };

  const canSubmit = !isLoading && !disabled && origin.trim() && destination.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4"
    >
      <AddressAutocomplete
        label="From"
        value={origin}
        onChange={setOrigin}
        placeholder="Starting point"
        icon={MapPin}
        rightSlot={
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800 disabled:opacity-50"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LocateFixed className="h-3.5 w-3.5" />
            )}
            Use current location
          </button>
        }
      />

      <AddressAutocomplete
        label="To"
        value={destination}
        onChange={setDestination}
        placeholder="Destination"
        icon={Navigation}
      />

      <fieldset>
        <legend className="text-xs font-medium text-gray-500 mb-2">Vehicle</legend>
        <div className="grid grid-cols-4 gap-2">
          {VEHICLE_ORDER.map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={vehicle === type}
              onClick={() => onVehicleChange(type)}
              className={`text-xs font-medium py-2 rounded-lg border transition-colors ${
                vehicle === type
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:border-green-300'
              }`}
            >
              {VEHICLE_PROFILES[type].label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-medium text-gray-500 mb-2">Priority</legend>
        <div className="grid grid-cols-3 gap-2">
          {PREFERENCES.map((p) => (
            <button
              key={p.value}
              type="button"
              aria-pressed={preference === p.value}
              onClick={() => onPreferenceChange(p.value)}
              className={`text-xs font-medium py-2 rounded-lg border transition-colors ${
                preference === p.value
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:border-green-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <Search className="h-5 w-5 mr-2" />
        )}
        {isLoading ? 'Finding routes…' : 'Find routes'}
      </button>

      {disabled && (
        <p className="text-xs text-amber-600">
          You are offline — live route search is unavailable.
        </p>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}
    </form>
  );
}
