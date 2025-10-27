import axios from 'axios';

export interface Coordinates {
  lng: number;
  lat: number;
}

export interface RouteResponse {
  routes: Array<{
    geometry: {
      coordinates: [number, number][];
    };
    distance: number;
    duration: number;
    legs: Array<{
      distance: number;
      duration: number;
      steps: any[];
    }>;
  }>;
  waypoints: Array<{
    location: [number, number];
  }>;
}

export class RouteService {
  static async geocodeAddress(address: string): Promise<Coordinates | null> {
    try {
      // Use OpenStreetMap Nominatim API for geocoding (free)
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      
      if (response.data && response.data.length > 0) {
        return {
          lng: parseFloat(response.data[0].lon),
          lat: parseFloat(response.data[0].lat)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  static async calculateRoute(origin: Coordinates, destination: Coordinates): Promise<RouteResponse | null> {
    try {
      // Use OSRM API for routing (free)
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
      );
      
      return response.data;
    } catch (error) {
      console.error('Routing error:', error);
      return null;
    }
  }

  static async getWeatherData(coordinates: Coordinates) {
    try {
      // Using OpenWeatherMap - you'll need a free API key
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!apiKey) {
        console.warn('OpenWeatherMap API key not found');
        return null;
      }

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lng}&appid=${apiKey}&units=metric`
      );
      return response.data;
    } catch (error) {
      console.error('Weather API error:', error);
      return null;
    }
  }

  static async getElevationData(coordinates: Coordinates) {
    try {
      // Using Open-Elevation API (free)
      const response = await axios.get(
        `https://api.open-elevation.com/api/v1/lookup?locations=${coordinates.lat},${coordinates.lng}`
      );
      return response.data;
    } catch (error) {
      console.error('Elevation API error:', error);
      return null;
    }
  }
}