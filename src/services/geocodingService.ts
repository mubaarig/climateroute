import axios from 'axios';
import { Coordinates } from '@/types/route';

export interface PlaceSuggestion {
  id: number;
  label: string;
  lat: number;
  lng: number;
}

/** Search for matching places (for address autocomplete) via Nominatim. */
export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const response = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { format: 'json', q: query, limit: 5, addressdetails: 0 },
  });

  if (!Array.isArray(response.data)) return [];
  return response.data.map((item) => ({
    id: item.place_id,
    label: item.display_name as string,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}

/** Resolve a free-text address to coordinates using OpenStreetMap Nominatim. */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  const response = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { format: 'json', q: address, limit: 1 },
  });

  if (Array.isArray(response.data) && response.data.length > 0) {
    return {
      lng: parseFloat(response.data[0].lon),
      lat: parseFloat(response.data[0].lat),
    };
  }
  return null;
}

/** Resolve coordinates to a human-readable address (for "use current location"). */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
    params: { format: 'json', lat, lon: lng },
  });
  return response.data?.display_name ?? null;
}
