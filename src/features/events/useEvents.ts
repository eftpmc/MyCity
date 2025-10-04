/**
 * Custom hook for fetching EONET events with debouncing
 */

import { useEffect, useRef, useState } from 'react';
import { fetchEvents } from '../../services/eonet';
import { EonetEvent, EventQuery } from '../../types/events';

const DEBOUNCE_MS = 400;

interface UseEventsResult {
  data: EonetEvent[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook that fetches events with debouncing
 * Automatically refetches when query changes
 */
export function useEvents(query: EventQuery): UseEventsResult {
  const [data, setData] = useState<EonetEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Use a ref to track the current query
  const queryKey = JSON.stringify(query);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetch = async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      setLoading(true);
      setError(null);

      const events = await fetchEvents(query);
      setData(events);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        console.error('[useEvents] Error fetching events:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetch();
  };

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new debounced fetch
    timeoutRef.current = setTimeout(() => {
      fetch();
    }, DEBOUNCE_MS);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [queryKey]);

  return { data, loading, error, refetch };
}

