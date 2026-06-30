'use client';

import { useQuery } from '@tanstack/react-query';
import { searchPlaces } from '@/services/geocodingService';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const MIN_QUERY_LENGTH = 3;

/**
 * Debounced, cached place suggestions for address autocomplete. Only queries once
 * the input has at least a few characters, and caches results so repeated lookups
 * (and back-and-forth edits) don't re-hit Nominatim.
 */
export function usePlaceSuggestions(query: string, enabled = true) {
  const debouncedQuery = useDebouncedValue(query.trim(), 350);
  const active = enabled && debouncedQuery.length >= MIN_QUERY_LENGTH;

  const { data } = useQuery({
    queryKey: ['places', debouncedQuery.toLowerCase()],
    queryFn: () => searchPlaces(debouncedQuery),
    enabled: active,
    staleTime: 5 * 60 * 1000,
  });

  return { suggestions: active ? (data ?? []) : [] };
}
