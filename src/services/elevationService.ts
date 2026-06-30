import axios from 'axios';

interface ElevationPoint {
  latitude: number;
  longitude: number;
  elevation: number;
}

/**
 * Pick up to `maxSamples` evenly spaced points from a route's geometry so we can
 * build an elevation profile for the whole path, not just the endpoints.
 * Coordinates are GeoJSON [lng, lat] pairs.
 */
export function sampleCoordinates(
  coordinates: [number, number][],
  maxSamples = 8
): [number, number][] {
  if (coordinates.length <= maxSamples) return coordinates;

  const step = (coordinates.length - 1) / (maxSamples - 1);
  const samples: [number, number][] = [];
  for (let i = 0; i < maxSamples; i++) {
    samples.push(coordinates[Math.round(i * step)]);
  }
  return samples;
}

/**
 * Total positive elevation gain (meters) along a route, sampled from its geometry
 * via the free Open-Elevation API. Returns 0 if elevation data is unavailable, so
 * a failed lookup never penalises a route.
 */
export async function fetchElevationGain(coordinates: [number, number][]): Promise<number> {
  if (coordinates.length < 2) return 0;

  const samples = sampleCoordinates(coordinates);
  const locations = samples.map(([lng, lat]) => `${lat},${lng}`).join('|');

  try {
    const response = await axios.get('https://api.open-elevation.com/api/v1/lookup', {
      params: { locations },
    });

    const results: ElevationPoint[] = response.data?.results ?? [];
    if (results.length < 2) return 0;

    let gain = 0;
    for (let i = 1; i < results.length; i++) {
      const delta = results[i].elevation - results[i - 1].elevation;
      if (delta > 0) gain += delta;
    }
    return Math.round(gain);
  } catch (error) {
    console.error('Elevation lookup failed:', error);
    return 0;
  }
}
