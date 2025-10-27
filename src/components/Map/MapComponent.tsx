'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  onMapLoad?: (map: L.Map) => void;
  children?: React.ReactNode;
}

// Component to handle map instance
function MapController({ onMapLoad }: { onMapLoad?: (map: L.Map) => void }) {
  const map = useMap();
  
  useEffect(() => {
    // Invoke the provided callback once React Leaflet gives us the map instance.
    if (map && onMapLoad) {
      onMapLoad(map);
    }
  }, [map, onMapLoad]);

  return null;
}

export default function MapComponent({ onMapLoad, children }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);
  
  // Default center (New York)
  const defaultCenter: LatLngExpression = [40.7128, -74.0060];
  const defaultZoom = 10;

  useEffect(() => {
    // Defer rendering of the map until we're on the client to avoid SSR mismatch issues.
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full rounded-lg shadow-lg bg-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg shadow-lg">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Allow parents to hook into the map instance and inject their own layers/controls. */}
        <MapController onMapLoad={onMapLoad} />
        {children}
      </MapContainer>
    </div>
  );
}
