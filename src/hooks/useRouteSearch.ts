import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RoutePlan } from '@/types/route';
import { geocodeAddress } from '@/services/geocodingService';
import { fetchRoutes } from '@/services/routingService';
import { assessWeather } from '@/services/weatherService';
import { fetchElevationGain } from '@/services/elevationService';
import { planRoutes, PlanInput } from '@/lib/planRoutes';
import { useRouteStore } from '@/store/useRouteStore';

/**
 * Drives a route search as a React Query mutation. Each underlying API call is
 * routed through the query cache (`fetchQuery`), so repeated geocodes, routes,
 * weather and elevation lookups are deduplicated and cached — React Query owns
 * server state while Zustand owns UI state.
 */
export function useRouteSearch() {
  const queryClient = useQueryClient();
  const setLoadingStep = useRouteStore((s) => s.setLoadingStep);

  return useMutation<RoutePlan, Error, PlanInput>({
    mutationFn: (input) =>
      planRoutes(input, {
        geocode: (address) =>
          queryClient.fetchQuery({
            queryKey: ['geocode', address.trim().toLowerCase()],
            queryFn: () => geocodeAddress(address),
            staleTime: Infinity,
          }),
        route: (origin, destination) =>
          queryClient.fetchQuery({
            queryKey: ['route', origin, destination],
            queryFn: () => fetchRoutes(origin, destination),
          }),
        weather: (coordinates) =>
          queryClient.fetchQuery({
            queryKey: ['weather', coordinates.lat.toFixed(2), coordinates.lng.toFixed(2)],
            queryFn: () => assessWeather(coordinates),
          }),
        elevationGain: (coordinates) =>
          queryClient.fetchQuery({
            queryKey: [
              'elevation',
              coordinates.length,
              coordinates[0],
              coordinates[coordinates.length - 1],
            ],
            queryFn: () => fetchElevationGain(coordinates),
          }),
        onStep: setLoadingStep,
      }),
    onSettled: () => setLoadingStep(null),
  });
}
