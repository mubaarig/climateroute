'use client';

import { Leaf, Gauge, Factory, Smartphone, Car } from 'lucide-react';
import { RouteOption, VehicleType } from '@/types/route';
import { AVERAGE_PETROL_GRAMS_PER_KM, VEHICLE_PROFILES } from '@/utils/emissions';

interface CarbonBudgetProps {
  route: RouteOption;
  vehicle: VehicleType;
}

// Illustrative weekly transport carbon budget (kg CO2e) for context only.
const WEEKLY_BUDGET_KG = 35;
// Approx. CO2e to fully charge a smartphone (~8 g).
const PHONE_CHARGE_KG = 0.008;

const formatNumber = (value: number, digits = 1) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export default function CarbonBudget({ route, vehicle }: CarbonBudgetProps) {
  const distanceKm = route.distance / 1000;
  const emissionsKg = route.emissionsKg;

  const phoneCharges = emissionsKg / PHONE_CHARGE_KG;
  const petrolEquivalentKm = (emissionsKg * 1000) / AVERAGE_PETROL_GRAMS_PER_KM;
  const budgetShare = Math.min(100, (emissionsKg / WEEKLY_BUDGET_KG) * 100);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <Leaf className="h-4 w-4 text-green-600 mr-2" aria-hidden />
          Carbon impact
        </h3>
        <span className="text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
          {VEHICLE_PROFILES[vehicle].label}
        </span>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-gray-900">{formatNumber(emissionsKg, 2)}</span>
          <span className="text-sm text-gray-500">kg CO₂e</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Share of illustrative weekly budget</span>
          <span>{formatNumber(budgetShare, 0)}%</span>
        </div>
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-green-500"
            style={{ width: `${budgetShare}%` }}
          />
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <Gauge className="h-4 w-4 text-green-600 mt-0.5" aria-hidden />
          <div>
            <dt className="text-xs text-gray-500">Distance</dt>
            <dd className="font-medium text-gray-800">{formatNumber(distanceKm)} km</dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Smartphone className="h-4 w-4 text-green-600 mt-0.5" aria-hidden />
          <div>
            <dt className="text-xs text-gray-500">Phone charges</dt>
            <dd className="font-medium text-gray-800">{formatNumber(phoneCharges, 0)}×</dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Car className="h-4 w-4 text-green-600 mt-0.5" aria-hidden />
          <div>
            <dt className="text-xs text-gray-500">Petrol-car km</dt>
            <dd className="font-medium text-gray-800">{formatNumber(petrolEquivalentKm)} km</dd>
          </div>
        </div>
      </dl>

      <p className="flex items-start gap-1.5 text-[11px] text-gray-400">
        <Factory className="h-3.5 w-3.5 mt-px shrink-0" aria-hidden />
        Estimate uses {VEHICLE_PROFILES[vehicle].gramsPerKm} g CO₂e/km for a{' '}
        {VEHICLE_PROFILES[vehicle].label.toLowerCase()} vehicle.
      </p>
    </section>
  );
}
