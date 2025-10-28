'use client';

import { Leaf, Gauge, Factory } from 'lucide-react';
import { ClimateCalculator } from '@/utils/climateCalculator';

interface CarbonBudgetProps {
  routeDistance: number;
  climateScore: number;
}

const formatNumber = (value: number, fractionDigits = 1) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

export default function CarbonBudget({ routeDistance, climateScore }: CarbonBudgetProps) {
  const distanceKm = routeDistance / 1000;
  const baselineEmissionsKg = routeDistance * 0.0004;
  const co2SavingsKg = ClimateCalculator.calculateCO2Savings(routeDistance, climateScore);
  const netEmissionsKg = Math.max(0, baselineEmissionsKg - co2SavingsKg);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Leaf className="h-5 w-5 text-green-600 mr-2" />
          Carbon Budget
        </h3>
        <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
          {climateScore}% eco score
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2 text-sm text-gray-600">
          <span>Route footprint</span>
          <span>{formatNumber(netEmissionsKg, 2)} kg CO2e</span>
        </div>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-green-500"
            style={{ width: `${Math.min(100, climateScore)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
        <div className="flex items-start space-x-3">
          <Gauge className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium">Distance</p>
            <p className="text-gray-500">{formatNumber(distanceKm)} km</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Factory className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium">Avoided emissions</p>
            <p className="text-gray-500">{formatNumber(co2SavingsKg, 2)} kg CO2e</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Leaf className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium">Cleaner than typical</p>
            <p className="text-gray-500">
              {formatNumber((co2SavingsKg / (baselineEmissionsKg || 1)) * 100)}% savings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
