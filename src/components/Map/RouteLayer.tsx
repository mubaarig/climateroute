'use client';
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { RouteOption } from '@/types/route';

// Custom route icons
const createRouteIcon = (color: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
    className: 'route-marker',
    iconSize: [16, 16],
  });
};

interface RouteLayerProps {
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  onRouteSelect: (route: RouteOption) => void;
}

export default function RouteLayer({ routes, selectedRoute, onRouteSelect }: RouteLayerProps) {
  const map = useMap();
  const routeLayersRef = useRef<L.LayerGroup>(L.layerGroup());
  const routeMarkersRef = useRef<L.LayerGroup>(L.layerGroup());

  useEffect(() => {
    // Add layer groups to map
    routeLayersRef.current.addTo(map);
    routeMarkersRef.current.addTo(map);

    return () => {
      // Cleanup
      map.removeLayer(routeLayersRef.current);
      map.removeLayer(routeMarkersRef.current);
    };
  }, [map]);

  useEffect(() => {
    // Clear existing routes
    routeLayersRef.current.clearLayers();
    routeMarkersRef.current.clearLayers();

    if (routes.length === 0) return;

    routes.forEach((route) => {
      if (route.coordinates.length < 2) return;

      const isSelected = selectedRoute?.id === route.id;
      const routeColor = isSelected ? '#10b981' : '#6b7280';
      const routeWeight = isSelected ? 6 : 4;

      // Convert coordinates to LatLng tuples
      const latLngs: L.LatLngExpression[] = route.coordinates.map(coord => 
        [coord[1], coord[0]] as L.LatLngExpression
      );

      // Draw route polyline
      const polyline = L.polyline(latLngs, {
        color: routeColor,
        weight: routeWeight,
        opacity: 0.8,
        lineJoin: 'round' as any,
        lineCap: 'round' as any,
      });

      // Add click handler
      polyline.on('click', () => {
        onRouteSelect(route);
      });

      // Change cursor on hover
      polyline.on('mouseover', () => {
        polyline.setStyle({ weight: routeWeight + 2 });
        map.getContainer().style.cursor = 'pointer';
      });

      polyline.on('mouseout', () => {
        polyline.setStyle({ weight: routeWeight });
        map.getContainer().style.cursor = '';
      });

      routeLayersRef.current.addLayer(polyline);

      // Add start and end markers
      if (latLngs.length > 0) {
        const startMarker = L.marker(latLngs[0], {
          icon: createRouteIcon('#10b981'),
        }).bindTooltip('Start', { permanent: false });

        const endMarker = L.marker(latLngs[latLngs.length - 1], {
          icon: createRouteIcon('#ef4444'),
        }).bindTooltip('End', { permanent: false });

        routeMarkersRef.current.addLayer(startMarker);
        routeMarkersRef.current.addLayer(endMarker);
      }
    });

    // Fit map to show all routes
    if (routes.length > 0 && routes[0].coordinates.length > 0) {
      const group = new L.FeatureGroup();
      routes.forEach(route => {
        if (route.coordinates.length > 0) {
          const latLngs = route.coordinates.map(coord => [coord[1], coord[0]] as L.LatLngExpression);
          group.addLayer(L.polyline(latLngs));
        }
      });
      map.fitBounds(group.getBounds().pad(0.1));
    }

  }, [routes, selectedRoute, map, onRouteSelect]);

  return null;
}