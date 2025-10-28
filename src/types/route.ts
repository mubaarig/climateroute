export interface RouteOption {
  id: string;
  name: string;
  distance: number; // meters
  duration: number; // seconds
  coordinates: [number, number][]; // [lng, lat] for consistency with GeoJSON
  climateScore: number;
  co2Savings: number;
  factors: {
    traffic: 'low' | 'moderate' | 'high';
    elevation: 'low' | 'moderate' | 'high';
    weather: 'favorable' | 'moderate' | 'unfavorable';
  };
}

export interface RouteCalculation {
  origin: string;
  destination: string;
  routes: RouteOption[];
  timestamp: number;
}
