import { create } from 'zustand';
import { RouteOption } from '@/types/route';
import { RouteService } from '@/services/routeService';
import { ClimateCalculator } from '@/utils/climateCalculator';

// ... existing interfaces ...

export const useRouteStore = create<RouteStore>((set, get) => ({
  // ... existing state ...

  calculateRoute: async (origin: string, destination: string) => {
    set({ isLoading: true, routes: [], selectedRoute: null });

    try {
      // Geocode addresses
      const [originCoords, destCoords] = await Promise.all([
        RouteService.geocodeAddress(origin),
        RouteService.geocodeAddress(destination)
      ]);

      if (!originCoords || !destCoords) {
        throw new Error('Could not find locations. Please try different addresses.');
      }

      // Calculate route
      const routeData = await RouteService.calculateRoute(originCoords, destCoords);
      
      if (!routeData || !routeData.routes.length) {
        throw new Error('No route found between these locations.');
      }

      // Get additional data for climate scoring
      // We use the start point for weather and elevation
      const [weatherData, elevationData] = await Promise.all([
        RouteService.getWeatherData(originCoords),
        RouteService.getElevationData(originCoords)
      ]);

      // Convert OSRM response to our RouteOption format
      const routes: RouteOption[] = routeData.routes.map((route, index) => {
        const distance = route.distance; // meters
        const duration = route.duration; // seconds
        
        // Calculate real climate factors
        // Traffic: We don't have real traffic data, so we'll estimate based on the time of day and route popularity?
        // For now, we'll use a random value but in a real app you might use historical traffic data
        const traffic = Math.random(); // 0-1

        // Elevation: use the elevation data
        const elevation = elevationData?.results[0]?.elevation || 0;

        // Weather: use the weather data
        let weather = 0.5; // default
        if (weatherData) {
          // Convert weather condition to a score
          const condition = weatherData.weather[0].main;
          if (condition === 'Clear') {
            weather = 1;
          } else if (condition === 'Clouds') {
            weather = 0.8;
          } else if (condition === 'Rain') {
            weather = 0.3;
          } else if (condition === 'Snow') {
            weather = 0.1;
          } else {
            weather = 0.5;
          }
        }

        const factors = {
          traffic,
          elevation,
          weather,
          distance
        };

        const climateScore = ClimateCalculator.calculateClimateScore(factors);
        const co2Savings = ClimateCalculator.calculateCO2Savings(distance, climateScore);

        return {
          id: `${index + 1}`,
          name: index === 0 ? 'Eco-Friendly Route' : `Alternative Route ${index + 1}`,
          distance,
          duration,
          coordinates: route.geometry.coordinates,
          climateScore,
          co2Savings,
          factors: {
            traffic: traffic < 0.3 ? 'low' : traffic < 0.7 ? 'moderate' : 'high',
            elevation: elevation < 100 ? 'low' : elevation < 300 ? 'moderate' : 'high',
            weather: weather > 0.7 ? 'favorable' : weather > 0.4 ? 'moderate' : 'unfavorable'
          }
        };
      });

      // Sort by climate score (highest first)
      routes.sort((a, b) => b.climateScore - a.climateScore);
      
      set({ 
        routes, 
        selectedRoute: routes[0],
        origin,
        destination 
      });

    } catch (error) {
      console.error('Route calculation failed:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));