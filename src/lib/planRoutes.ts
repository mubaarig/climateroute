import { Coordinates, RoutePlan, RoutePreference, VehicleType } from '@/types/route';
import { OsrmRoute } from '@/services/routingService';
import { WeatherAssessment } from '@/services/weatherService';
import { RawRoute, scoreRoutes } from '@/utils/climateCalculator';

export type PlanStep = 'geocoding' | 'routing' | 'enriching' | 'scoring';

export type RouteErrorCode = 'geocode_failed' | 'same_location' | 'no_route' | 'unknown';

export class RouteError extends Error {
  constructor(
    public code: RouteErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'RouteError';
  }
}

export interface PlanInput {
  origin: string;
  destination: string;
  vehicle: VehicleType;
  preference: RoutePreference;
}

export interface PlanDeps {
  geocode: (address: string) => Promise<Coordinates | null>;
  route: (origin: Coordinates, destination: Coordinates) => Promise<OsrmRoute[]>;
  weather: (coordinates: Coordinates) => Promise<WeatherAssessment>;
  elevationGain: (coordinates: [number, number][]) => Promise<number>;
  onStep?: (step: PlanStep) => void;
}

// Two points within this many degrees (~11m) are treated as the same place.
const SAME_LOCATION_TOLERANCE = 0.0001;

function isSameLocation(a: Coordinates, b: Coordinates): boolean {
  return (
    Math.abs(a.lat - b.lat) < SAME_LOCATION_TOLERANCE &&
    Math.abs(a.lng - b.lng) < SAME_LOCATION_TOLERANCE
  );
}

/**
 * End-to-end route planning: geocode -> route -> enrich (elevation per route,
 * weather at origin) -> deterministic scoring. Throws RouteError with a code the
 * UI can turn into a helpful message.
 */
export async function planRoutes(input: PlanInput, deps: PlanDeps): Promise<RoutePlan> {
  const { origin, destination, vehicle, preference } = input;

  deps.onStep?.('geocoding');
  const [originCoords, destCoords] = await Promise.all([
    deps.geocode(origin),
    deps.geocode(destination),
  ]);

  if (!originCoords || !destCoords) {
    throw new RouteError(
      'geocode_failed',
      'We could not find one or both addresses. Try adding a city or country.'
    );
  }

  if (isSameLocation(originCoords, destCoords)) {
    throw new RouteError(
      'same_location',
      'The destination needs to be different from the start location.'
    );
  }

  deps.onStep?.('routing');
  const osrmRoutes = await deps.route(originCoords, destCoords);
  if (osrmRoutes.length === 0) {
    throw new RouteError(
      'no_route',
      'No driving route was found. The locations may be separated by water or unsupported roads.'
    );
  }

  deps.onStep?.('enriching');
  // Weather is sampled once at the origin; elevation is sampled along each route's
  // geometry so hillier alternatives are penalised correctly.
  const [weather, elevationGains] = await Promise.all([
    deps.weather(originCoords),
    Promise.all(osrmRoutes.map((r) => deps.elevationGain(r.geometry.coordinates))),
  ]);

  deps.onStep?.('scoring');
  const rawRoutes: RawRoute[] = osrmRoutes.map((route, index) => ({
    distance: route.distance,
    duration: route.duration,
    coordinates: route.geometry.coordinates,
    elevationGain: elevationGains[index],
    weatherScore: weather.score,
    weatherLabel: weather.label,
  }));

  return {
    origin,
    destination,
    vehicle,
    preference,
    routes: scoreRoutes(rawRoutes, vehicle),
    timestamp: Date.now(),
  };
}
