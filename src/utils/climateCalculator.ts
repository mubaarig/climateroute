export interface ClimateFactors {
  traffic: number; // 0-1 scale (from traffic data or estimate)
  elevation: number; // net elevation gain in meters (from elevation data)
  weather: number; // 0-1 scale (0 = bad, 1 = good) (from weather data)
  distance: number; // in meters
}

export class ClimateCalculator {
  static calculateClimateScore(factors: ClimateFactors): number {
    const { traffic, elevation, weather, distance } = factors;

    // Normalize factors (these weights can be adjusted)
    const trafficWeight = 0.3;
    const elevationWeight = 0.25;
    const weatherWeight = 0.2;
    const distanceWeight = 0.25;

    // Calculate individual scores (higher is better)
    const trafficScore = (1 - traffic) * 100; // Less traffic = better
    const elevationScore = Math.max(0, 100 - elevation * 0.1); // Less elevation gain = better
    const weatherScore = weather * 100; // Better weather = better
    const distanceScore = Math.max(0, 100 - distance / 1000); // Shorter distance = better

    // Weighted average
    const totalScore =
      trafficScore * trafficWeight +
      elevationScore * elevationWeight +
      weatherScore * weatherWeight +
      distanceScore * distanceWeight;

    return Math.min(100, Math.max(0, Math.round(totalScore)));
  }

  static calculateCO2Savings(distance: number, climateScore: number): number {
    // Base CO2 emissions for average car: ~0.4 kg/km
    const baseEmissions = distance * 0.0004; // Convert to kg
    const savingsPercentage = climateScore / 100;

    // Better routes can save up to 30% of emissions
    return baseEmissions * 0.3 * savingsPercentage;
  }
}
