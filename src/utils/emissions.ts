import { VehicleType } from '@/types/route';

export interface VehicleProfile {
  type: VehicleType;
  label: string;
  // Well-to-wheel CO2e in grams per kilometre. Rough averages drawn from
  // typical EU passenger-vehicle figures; intended to be representative, not exact.
  gramsPerKm: number;
}

export const VEHICLE_PROFILES: Record<VehicleType, VehicleProfile> = {
  petrol: { type: 'petrol', label: 'Petrol', gramsPerKm: 192 },
  diesel: { type: 'diesel', label: 'Diesel', gramsPerKm: 171 },
  hybrid: { type: 'hybrid', label: 'Hybrid', gramsPerKm: 111 },
  ev: { type: 'ev', label: 'Electric', gramsPerKm: 53 },
};

export const VEHICLE_ORDER: VehicleType[] = ['petrol', 'diesel', 'hybrid', 'ev'];

// Reference for a high-emitting large vehicle (e.g. a large SUV). Used to scale
// the emissions sub-score so even a petrol car sits below the worst case rather
// than always bottoming out at zero.
export const REFERENCE_WORST_GRAMS_PER_KM = 250;

// Average petrol car, used for "equivalent to driving X km" comparisons.
export const AVERAGE_PETROL_GRAMS_PER_KM = VEHICLE_PROFILES.petrol.gramsPerKm;

/** Estimated CO2e in kilograms for a distance (meters) driven by a vehicle. */
export function estimateEmissionsKg(distanceMeters: number, vehicle: VehicleType): number {
  const distanceKm = distanceMeters / 1000;
  return (distanceKm * VEHICLE_PROFILES[vehicle].gramsPerKm) / 1000;
}
