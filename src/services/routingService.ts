import axios from 'axios';
import { Coordinates } from '@/types/route';

export interface OsrmRoute {
  geometry: { coordinates: [number, number][] };
  distance: number; // meters
  duration: number; // seconds
}

export interface RoutingResponse {
  routes: OsrmRoute[];
}

/**
 * Fetch driving routes between two points from the public OSRM server.
 * `alternatives=true` asks for more than one option so we have routes to compare.
 */
export async function fetchRoutes(
  origin: Coordinates,
  destination: Coordinates
): Promise<OsrmRoute[]> {
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const response = await axios.get<RoutingResponse>(
    `https://router.project-osrm.org/route/v1/driving/${coords}`,
    {
      params: {
        overview: 'full',
        geometries: 'geojson',
        alternatives: true,
      },
    }
  );

  return response.data?.routes ?? [];
}
