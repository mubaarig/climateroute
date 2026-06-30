import { create } from 'zustand';
import { RoutePreference, VehicleType } from '@/types/route';
import { PlanStep } from '@/lib/planRoutes';

/**
 * UI / application state only. Server state (routes, weather, elevation) lives in
 * React Query — see useRouteSearch.
 */
interface RouteStore {
  vehicle: VehicleType;
  preference: RoutePreference;
  selectedRouteId: string | null;
  // Which stage of the search pipeline is running, for progressive loading UI.
  loadingStep: PlanStep | null;

  setVehicle: (vehicle: VehicleType) => void;
  setPreference: (preference: RoutePreference) => void;
  setSelectedRouteId: (id: string | null) => void;
  setLoadingStep: (step: PlanStep | null) => void;
}

export const useRouteStore = create<RouteStore>((set) => ({
  vehicle: 'petrol',
  preference: 'greenest',
  selectedRouteId: null,
  loadingStep: null,

  setVehicle: (vehicle) => set({ vehicle }),
  setPreference: (preference) => set({ preference }),
  setSelectedRouteId: (selectedRouteId) => set({ selectedRouteId }),
  setLoadingStep: (loadingStep) => set({ loadingStep }),
}));
