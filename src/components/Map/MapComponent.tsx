'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
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
  // Default center (New York)
  const defaultCenter: LatLngExpression = [40.7128, -74.006];
  const defaultZoom = 10;

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
