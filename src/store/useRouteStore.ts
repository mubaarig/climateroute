import { create } from 'zustand';
import { RouteOption } from '@/types/route';
import { RouteService } from '@/services/routeService';

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
      const [weatherData, elevationData] = await Promise.all([
        RouteService.getWeatherData(originCoords),
        RouteService.getElevationData(originCoords)
      ]);

      // Convert OSRM response to our RouteOption format
      const routes: RouteOption[] = routeData.routes.map((route, index) => {
        const distance = route.distance; // meters
        const duration = route.duration; // seconds
        
        // Mock climate factors - in real implementation, calculate based on real data
        const traffic = Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'moderate' : 'low';
        const elevation = Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'moderate' : 'low';
        const weather = weatherData ? 
          (weatherData.weather[0].main === 'Rain' ? 'unfavorable' : 'favorable') : 
          'moderate';

        // Calculate climate score based on factors
        const baseScore = 70;
        const trafficBonus = traffic === 'low' ? 15 : traffic === 'moderate' ? 5 : 0;
        const elevationBonus = elevation === 'low' ? 10 : elevation === 'moderate' ? 5 : 0;
        const weatherBonus = weather === 'favorable' ? 5 : 0;
        
        const climateScore = Math.min(95, baseScore + trafficBonus + elevationBonus + weatherBonus);
        const co2Savings = (distance / 1000) * 0.1 * (climateScore / 100);

        return {
          id: `${index + 1}`,
          name: index === 0 ? 'Eco-Friendly Route' : `Alternative Route ${index + 1}`,
          distance,
          duration,
          coordinates: route.geometry.coordinates,
          climateScore,
          co2Savings,
          factors: {
            traffic,
            elevation,
            weather
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