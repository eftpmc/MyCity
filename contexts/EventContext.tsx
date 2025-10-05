import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

// ============================================================================
// TYPES
// ============================================================================

export type EonetGeometry = { 
  date: string; 
  type: 'Point' | string; 
  coordinates: [number, number] 
};

export type EonetCategory = { 
  id: number; 
  title: string; 
  slug: string 
};

export interface EonetEvent {
  id: string;
  title: string;
  link: string;
  categories: EonetCategory[];
  geometry: EonetGeometry[];
}

export type EventQuery = { 
  start: string; 
  end: string; 
  categories: string[]; 
  bbox?: [number, number, number, number]; 
  status?: 'open' | 'closed' | 'all'; 
  limit?: number; 
};

export type FilterState = { 
  start: string; 
  end: string; 
  categories: string[]; 
  viewportOnly: boolean; 
};

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

interface EventContextType {
  events: EonetEvent[];
  loading: boolean;
  error: Error | null;
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  region: Region | null;
  setRegion: (r: Region) => void;
  refreshEvents: () => Promise<void>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const CATEGORY_MAP: Record<string, string> = {
  "Dust and Haze": "dustHaze",
  "Manmade": "manmade",
  "Sea and Lake Ice": "seaLakeIce",
  "Severe Storms": "severeStorms",
  "Snow": "snow",
  "Volcanoes": "volcanoes",
  "Water Color": "waterColor",
  "Floods": "floods",
  "Wildfires": "wildfires"
};

export const DEFAULT_CATS = Object.values(CATEGORY_MAP);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function regionToBbox(r: Region): [number, number, number, number] {
  const west = r.longitude - r.longitudeDelta / 2;
  const east = r.longitude + r.longitudeDelta / 2;
  const south = r.latitude - r.latitudeDelta / 2;
  const north = r.latitude + r.latitudeDelta / 2;
  return [west, south, east, north];
}

function buildUrl(q: EventQuery, pageUrl?: string): string {
  if (pageUrl) return pageUrl;
  
  const u = new URL('https://eonet.gsfc.nasa.gov/api/v3/events');
  u.searchParams.set('status', q.status || 'all');
  u.searchParams.set('start', q.start);
  u.searchParams.set('end', q.end);
  
  if (q.categories.length) {
    u.searchParams.set('category', q.categories.join(','));
  }
  
  if (q.bbox) {
    u.searchParams.set('bbox', q.bbox.join(','));
  }
  
  u.searchParams.set('limit', String(q.limit || 100));
  
  return u.toString();
}

async function fetchEventsAPI(q: EventQuery): Promise<EonetEvent[]> {
  let allEvents: EonetEvent[] = [];
  let nextUrl: string | undefined = buildUrl(q);
  let pageCount = 0;
  const maxPages = 3;

  console.log('[EONET] Fetching events:', nextUrl);

  while (nextUrl && pageCount < maxPages) {
    const response: Response = await fetch(nextUrl);
    
    if (!response.ok) {
      throw new Error(`EONET API error: ${response.status} ${response.statusText}`);
    }

    const data: any = await response.json();
    
    if (data.events && Array.isArray(data.events)) {
      allEvents = allEvents.concat(data.events);
    }

    nextUrl = data.link?.next || data.links?.next;
    pageCount++;
    
    if (nextUrl) {
      console.log(`[EONET] Following page ${pageCount + 1}:`, nextUrl);
    }
  }

  console.log(`[EONET] Fetched ${allEvents.length} events across ${pageCount} page(s)`);
  return allEvents;
}

// Helper to get default date range (1 year ago to today in UTC)
function getDefaultDateRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

// ============================================================================
// CONTEXT
// ============================================================================

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dateRange = getDefaultDateRange();
  
  const [events, setEvents] = useState<EonetEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    start: dateRange.start,
    end: dateRange.end,
    categories: DEFAULT_CATS,
    viewportOnly: true
  });

  // Debouncing
  const debounceTimerRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchEvents = useCallback(async () => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      setLoading(true);
      setError(null);

      // Build query
      const query: EventQuery = {
        start: filters.start,
        end: filters.end,
        categories: filters.categories,
        status: 'all',
        limit: 100
      };

      // Add bbox if viewport-only is enabled and region is set
      if (filters.viewportOnly && region) {
        query.bbox = regionToBbox(region);
      }

      // Create abort controller for this request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const fetchedEvents = await fetchEventsAPI(query);
      
      // Only update if not aborted
      if (!controller.signal.aborted) {
        setEvents(fetchedEvents);
        abortControllerRef.current = null;
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('[EONET] Error fetching events:', err);
        setError(err instanceof Error ? err : new Error(err.message || 'Failed to load events'));
      }
    } finally {
      setLoading(false);
    }
  }, [filters, region]);

  // Debounced fetch effect (100ms for ultra-fast, smooth updates)
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer - 100ms for near-instant map updates
    debounceTimerRef.current = setTimeout(() => {
      fetchEvents();
    }, 100);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchEvents]);

  const value: EventContextType = {
    events,
    loading,
    error,
    filters,
    setFilters,
    region,
    setRegion,
    refreshEvents: fetchEvents
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvents must be used within an EventProvider");
  return ctx;
};