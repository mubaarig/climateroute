import { describe, it, expect } from 'vitest';
import { scoreRoutes, emissionsScore, RawRoute } from './climateCalculator';

const baseRoute = (overrides: Partial<RawRoute> = {}): RawRoute => ({
  distance: 18_000,
  duration: 1800,
  coordinates: [
    [0, 0],
    [1, 1],
  ],
  elevationGain: 100,
  weatherScore: 0.8,
  weatherLabel: 'favorable',
  ...overrides,
});

describe('emissionsScore', () => {
  it('rates an EV higher than a petrol car', () => {
    expect(emissionsScore('ev')).toBeGreaterThan(emissionsScore('petrol'));
  });

  it('stays within 0-100', () => {
    for (const v of ['petrol', 'diesel', 'hybrid', 'ev'] as const) {
      expect(emissionsScore(v)).toBeGreaterThanOrEqual(0);
      expect(emissionsScore(v)).toBeLessThanOrEqual(100);
    }
  });
});

describe('scoreRoutes', () => {
  it('is deterministic — identical input yields identical scores', () => {
    const input = [baseRoute()];
    const a = scoreRoutes(input, 'petrol');
    const b = scoreRoutes(input, 'petrol');
    expect(a[0].climateScore).toBe(b[0].climateScore);
  });

  it('penalises higher elevation gain', () => {
    const flat = scoreRoutes([baseRoute({ elevationGain: 0 })], 'petrol')[0];
    const hilly = scoreRoutes([baseRoute({ elevationGain: 800 })], 'petrol')[0];
    // Compared in isolation each is "best available", so compare relative ranking instead.
    const together = scoreRoutes(
      [baseRoute({ elevationGain: 0 }), baseRoute({ elevationGain: 800 })],
      'petrol'
    );
    const flatTogether = together.find((r) => r.factors.elevationGain === 0)!;
    const hillyTogether = together.find((r) => r.factors.elevationGain === 800)!;
    expect(flatTogether.climateScore).toBeGreaterThan(hillyTogether.climateScore);
    expect(flat.climateScore).toBeGreaterThanOrEqual(hilly.climateScore);
  });

  it('gives an EV a higher eco score than a petrol car for the same route', () => {
    const ev = scoreRoutes([baseRoute()], 'ev')[0];
    const petrol = scoreRoutes([baseRoute()], 'petrol')[0];
    expect(ev.climateScore).toBeGreaterThan(petrol.climateScore);
  });

  it('estimates lower CO2 for the shorter route', () => {
    const [short, long] = scoreRoutes(
      [baseRoute({ distance: 10_000 }), baseRoute({ distance: 30_000 })],
      'petrol'
    ).sort((a, b) => a.distance - b.distance);
    expect(short.emissionsKg).toBeLessThan(long.emissionsKg);
  });

  it('tags the greenest, fastest and shortest alternatives', () => {
    const routes = scoreRoutes(
      [
        baseRoute({ distance: 12_000, duration: 1500, elevationGain: 50 }),
        baseRoute({ distance: 20_000, duration: 1200, elevationGain: 400 }),
      ],
      'petrol'
    );
    const allTags = routes.flatMap((r) => r.tags);
    expect(allTags).toContain('greenest');
    expect(allTags).toContain('fastest');
    expect(allTags).toContain('shortest');
  });

  it('handles missing weather without producing an out-of-range score', () => {
    const route = scoreRoutes(
      [baseRoute({ weatherScore: null, weatherLabel: 'unavailable' })],
      'petrol'
    )[0];
    expect(route.climateScore).toBeGreaterThanOrEqual(0);
    expect(route.climateScore).toBeLessThanOrEqual(100);
  });

  it('returns an empty array for no routes', () => {
    expect(scoreRoutes([], 'petrol')).toEqual([]);
  });
});
