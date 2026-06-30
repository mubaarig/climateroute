import axios from 'axios';
import { Coordinates, WeatherLabel } from '@/types/route';

export interface WeatherAssessment {
  // 0-1 driving-suitability score (1 = ideal), or null when unavailable.
  score: number | null;
  label: WeatherLabel;
  condition?: string;
}

const UNAVAILABLE: WeatherAssessment = { score: null, label: 'unavailable' };

// Map an OpenWeather "main" condition to a driving-suitability score.
const CONDITION_SCORES: Record<string, number> = {
  Clear: 1,
  Clouds: 0.8,
  Drizzle: 0.5,
  Rain: 0.3,
  Thunderstorm: 0.2,
  Snow: 0.1,
};

function labelFor(score: number): WeatherLabel {
  if (score > 0.7) return 'favorable';
  if (score > 0.4) return 'moderate';
  return 'unfavorable';
}

/** Assess driving weather at a point. Returns an "unavailable" result if no API key or on error. */
export async function assessWeather(coordinates: Coordinates): Promise<WeatherAssessment> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) return UNAVAILABLE;

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat: coordinates.lat,
        lon: coordinates.lng,
        appid: apiKey,
        units: 'metric',
      },
    });

    const condition: string | undefined = response.data?.weather?.[0]?.main;
    const score = condition && condition in CONDITION_SCORES ? CONDITION_SCORES[condition] : 0.5;
    return { score, label: labelFor(score), condition };
  } catch (error) {
    console.error('Weather lookup failed:', error);
    return UNAVAILABLE;
  }
}
