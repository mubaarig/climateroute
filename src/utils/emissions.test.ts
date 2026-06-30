import { describe, it, expect } from 'vitest';
import { estimateEmissionsKg, VEHICLE_PROFILES } from './emissions';

describe('estimateEmissionsKg', () => {
  it('scales linearly with distance', () => {
    const ten = estimateEmissionsKg(10_000, 'petrol');
    const twenty = estimateEmissionsKg(20_000, 'petrol');
    expect(twenty).toBeCloseTo(ten * 2, 6);
  });

  it('matches the vehicle factor (10 km petrol = 1.92 kg)', () => {
    expect(estimateEmissionsKg(10_000, 'petrol')).toBeCloseTo(1.92, 6);
  });

  it('an EV emits less than a petrol car over the same distance', () => {
    expect(estimateEmissionsKg(15_000, 'ev')).toBeLessThan(estimateEmissionsKg(15_000, 'petrol'));
  });

  it('orders vehicles petrol > diesel > hybrid > ev', () => {
    const { petrol, diesel, hybrid, ev } = VEHICLE_PROFILES;
    expect(petrol.gramsPerKm).toBeGreaterThan(diesel.gramsPerKm);
    expect(diesel.gramsPerKm).toBeGreaterThan(hybrid.gramsPerKm);
    expect(hybrid.gramsPerKm).toBeGreaterThan(ev.gramsPerKm);
  });

  it('returns zero emissions for zero distance', () => {
    expect(estimateEmissionsKg(0, 'diesel')).toBe(0);
  });
});
