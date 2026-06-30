import { RouteOption, RouteTag, VehicleType, WeatherLabel } from '@/types/route';
import {
  estimateEmissionsKg,
  REFERENCE_WORST_GRAMS_PER_KM,
  VEHICLE_PROFILES,
} from '@/utils/emissions';

// Eco score weights. Emissions dominate because CO2 is the product's whole point;
// the remaining factors are the inputs that shape it. Traffic is deliberately
// absent — we have no live traffic feed and refuse to fabricate one.
export const SCORE_WEIGHTS = {
  emissions: 0.45,
  distance: 0.2,
  elevation: 0.2,
  duration: 0.1,
  weather: 0.05,
} as const;

export const SCORE_EXPLANATION =
  'The eco score is deterministic and weights estimated CO₂ emissions (45%), distance ' +
  '(20%), elevation gain (20%), driving smoothness (10%) and weather (5%). Distance, ' +
  'elevation and smoothness are scored relative to your route alternatives. Live traffic ' +
  'data is not available, so it does not affect the score.';

// A route as produced by the routing pipeline, before scoring.
export interface RawRoute {
  distance: number; // meters
  duration: number; // seconds
  coordinates: [number, number][];
  elevationGain: number; // meters
  weatherScore: number | null; // 0-1, or null when unavailable
  weatherLabel: WeatherLabel;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Emissions sub-score (0-100). Driven by how clean the chosen vehicle is relative
 * to a high-emitting reference vehicle. Independent of trip length so it reflects
 * vehicle efficiency rather than just penalising long journeys twice.
 */
export function emissionsScore(vehicle: VehicleType): number {
  const ratio = VEHICLE_PROFILES[vehicle].gramsPerKm / REFERENCE_WORST_GRAMS_PER_KM;
  return clamp(Math.round((1 - ratio) * 100), 0, 100);
}

/**
 * Scores and ranks a set of route alternatives for a given vehicle. Pure and
 * deterministic: identical inputs always yield identical output.
 */
export function scoreRoutes(rawRoutes: RawRoute[], vehicle: VehicleType): RouteOption[] {
  if (rawRoutes.length === 0) return [];

  const distances = rawRoutes.map((r) => r.distance);
  const durations = rawRoutes.map((r) => r.duration);
  const gains = rawRoutes.map((r) => r.elevationGain);

  const minDistance = Math.min(...distances);
  const minDuration = Math.min(...durations);
  const minGain = Math.min(...gains);
  const emission = emissionsScore(vehicle);

  const scored = rawRoutes.map((route, index) => {
    // Relative sub-scores: the best alternative on each axis gets 100.
    const distanceScore = route.distance > 0 ? (minDistance / route.distance) * 100 : 100;
    const durationScore = route.duration > 0 ? (minDuration / route.duration) * 100 : 100;
    // +1 offset keeps the math stable when the flattest route has zero gain.
    const elevationScoreValue = ((minGain + 1) / (route.elevationGain + 1)) * 100;

    const weights = { ...SCORE_WEIGHTS };
    const subScores: Record<keyof typeof SCORE_WEIGHTS, number> = {
      emissions: emission,
      distance: distanceScore,
      elevation: elevationScoreValue,
      duration: durationScore,
      weather: route.weatherScore !== null ? route.weatherScore * 100 : 0,
    };

    // Weather can be missing; drop its weight and renormalise the rest so the
    // score is never silently dragged down by absent data.
    let weightTotal = 0;
    let weighted = 0;
    (Object.keys(weights) as (keyof typeof SCORE_WEIGHTS)[]).forEach((key) => {
      if (key === 'weather' && route.weatherScore === null) return;
      weightTotal += weights[key];
      weighted += subScores[key] * weights[key];
    });

    const climateScore = clamp(Math.round(weighted / weightTotal), 0, 100);
    const emissionsKg = estimateEmissionsKg(route.distance, vehicle);

    return {
      id: `${index + 1}`,
      label: '',
      distance: route.distance,
      duration: route.duration,
      coordinates: route.coordinates,
      climateScore,
      emissionsKg,
      factors: {
        elevationGain: route.elevationGain,
        weatherScore: route.weatherScore,
        weatherLabel: route.weatherLabel,
        trafficSource: 'unavailable' as const,
      },
      reasons: [] as string[],
      tags: [] as RouteTag[],
    };
  });

  const multiple = scored.length > 1;

  // Assign superlative tags to the winning route on each axis.
  const greenestId = scored.reduce((a, b) => (b.climateScore > a.climateScore ? b : a)).id;
  const fastestId = scored.reduce((a, b) => (b.duration < a.duration ? b : a)).id;
  const shortestId = scored.reduce((a, b) => (b.distance < a.distance ? b : a)).id;

  scored.forEach((route) => {
    if (route.id === greenestId) route.tags.push('greenest');
    if (route.id === fastestId) route.tags.push('fastest');
    if (route.id === shortestId) route.tags.push('shortest');

    route.label = route.tags.includes('greenest')
      ? 'Greenest route'
      : route.tags.includes('fastest')
        ? 'Fastest route'
        : route.tags.includes('shortest')
          ? 'Shortest route'
          : `Alternative ${route.id}`;

    route.reasons = buildReasons(route, {
      multiple,
      isShortest: route.distance === minDistance,
      isFlattest: route.factors.elevationGain === minGain && gains.some((g) => g !== minGain),
      isFastest: route.duration === minDuration,
      vehicle,
    });
  });

  // Sort greenest first so the recommended option leads.
  return scored.sort((a, b) => b.climateScore - a.climateScore);
}

function buildReasons(
  route: RouteOption,
  ctx: {
    multiple: boolean;
    isShortest: boolean;
    isFlattest: boolean;
    isFastest: boolean;
    vehicle: VehicleType;
  }
): string[] {
  const reasons: string[] = [];

  if (ctx.multiple && ctx.isShortest) {
    reasons.push('Shortest distance, so less fuel burned');
  }
  if (ctx.multiple && ctx.isFlattest) {
    reasons.push('Least elevation gain');
  }
  if (ctx.multiple && ctx.isFastest) {
    reasons.push('Fastest of your options');
  }
  if (route.factors.weatherLabel === 'favorable') {
    reasons.push('Favorable driving weather');
  }
  if (ctx.vehicle === 'ev' || ctx.vehicle === 'hybrid') {
    reasons.push(`${VEHICLE_PROFILES[ctx.vehicle].label} vehicle keeps emissions low`);
  }
  if (reasons.length === 0) {
    reasons.push(
      ctx.multiple
        ? 'Balanced trade-off across distance and elevation'
        : 'Only route found for this trip'
    );
  }

  return reasons;
}
