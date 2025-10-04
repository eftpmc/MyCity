import { useMemo, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { EonetEvent, EventQuery } from '@/src/types/events';
import { fetchEvents } from '@/src/services/eonet';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 min
      gcTime: 1000 * 60 * 5, // 5 min
      retry: 1,
    },
  },
});

export function viewportKey(region?: {
  latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number;
}) {
  if (!region) return 'none';
  const p = 1e4;
  return [
    Math.round(region.latitude * p) / p,
    Math.round(region.longitude * p) / p,
    Math.round(region.latitudeDelta * p) / p,
    Math.round(region.longitudeDelta * p) / p,
  ].join(',');
}

export function useEvents(query: EventQuery, vpk?: string) {
  const key = useMemo(() => ['events', query, vpk ?? 'none'], [query, vpk]);
  return useQuery<{ events: EonetEvent[] }, Error>({
    queryKey: key,
    queryFn: async ({ signal }) => ({ events: await fetchEvents(query, signal) }),
  });
}

export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
