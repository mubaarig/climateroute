// Vehicle the user is driving. Drives the emissions estimate.
export type VehicleType = 'petrol' | 'diesel' | 'hybrid' | 'ev';

// How the user wants their recommended route chosen.
export type RoutePreference = 'greenest' | 'fastest' | 'balanced';

// Highlights a route earns relative to the other alternatives.
export type RouteTag = 'greenest' | 'fastest' | 'shortest';

export type WeatherLabel = 'favorable' | 'moderate' | 'unfavorable' | 'unavailable';

export interface Coordinates {
  lng: number;
  lat: number;
}

export interface RouteFactors {
  // Net climb between sampled points along the route, in meters.
  elevationGain: number;
  // 0-1 (1 = ideal driving weather), or null when weather data is unavailable.
  weatherScore: number | null;
  weatherLabel: WeatherLabel;
  // We have no live traffic feed, so we are explicit that it is not factored in
  // rather than fabricating a value.
  trafficSource: 'unavailable';
}

export interface RouteOption {
  id: string;
  label: string;
  distance: number; // meters
  duration: number; // seconds
  coordinates: [number, number][]; // [lng, lat] for GeoJSON consistency
  // Deterministic 0-100 eco score. Same inputs always produce the same score.
  climateScore: number;
  // Estimated CO2e for this route with the selected vehicle, in kg.
  emissionsKg: number;
  factors: RouteFactors;
  // Plain-English explanation of why this route scored the way it did.
  reasons: string[];
  // Which superlatives this route wins among the alternatives.
  tags: RouteTag[];
}

export interface RoutePlan {
  origin: string;
  destination: string;
  vehicle: VehicleType;
  preference: RoutePreference;
  routes: RouteOption[];
  timestamp: number;
}
