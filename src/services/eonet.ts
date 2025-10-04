/**
 * NASA EONET v3 API Service
 * Fetches natural events from https://eonet.gsfc.nasa.gov/api/v3/events
 */

import { EonetEvent, EonetPaginatedResponse, EventQuery } from '../types/events';

const BASE_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events';
const MAX_PAGES = 3;

/**
 * Compute bbox [west, south, east, north] from a MapView region
 */
export function regionToBbox(region: {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}): [number, number, number, number] {
  const west = region.longitude - region.longitudeDelta / 2;
  const east = region.longitude + region.longitudeDelta / 2;
  const south = region.latitude - region.latitudeDelta / 2;
  const north = region.latitude + region.latitudeDelta / 2;
  return [west, south, east, north];
}

/**
 * Builds the EONET API URL from query parameters
 */
export function buildEonetUrl(query: EventQuery): string {
  const url = new URL(BASE_URL);

  url.searchParams.set('status', query.status || 'all');
  url.searchParams.set('start', query.start);
  url.searchParams.set('end', query.end);

  if (query.categories && query.categories.length > 0) {
    url.searchParams.set('category', query.categories.join(','));
  }

  if (query.bbox) {
    url.searchParams.set('bbox', query.bbox.join(','));
  }

  url.searchParams.set('limit', String(query.limit || 100));

  return url.toString();
}

// Back-compat alias used in tests/other modules
export const buildEventsUrl = (q: EventQuery) => buildEonetUrl(q);

/**
 * Fetches a single page from the EONET API
 */
async function fetchPage(url: string, signal?: AbortSignal): Promise<EonetPaginatedResponse> {
  try {
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new Error(
        `EONET API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error?.name === 'AbortError' || String(error?.message || '').includes('aborted')) {
      // Return empty page on abort so callers can merge partial results without throwing
      return { title: '', description: '', link: '', events: [] } as EonetPaginatedResponse;
    }
    if (error instanceof Error) {
      throw new Error(`Failed to fetch EONET data: ${error.message}`);
    }
    throw new Error('Failed to fetch EONET data: Unknown error');
  }
}

/**
 * Fetches events from EONET API with pagination support (up to MAX_PAGES)
 * @param query - Event query parameters
 * @returns Array of EONET events
 */
export async function fetchEvents(query: EventQuery, signal?: AbortSignal): Promise<EonetEvent[]> {
  const allEvents: EonetEvent[] = [];
  let currentUrl = buildEonetUrl(query);
  let pageCount = 0;

  try {
    while (currentUrl && pageCount < MAX_PAGES) {
      const data = await fetchPage(currentUrl, signal);
      allEvents.push(...data.events);

      pageCount++;

      // Check if there's a next page
      if (data.links?.next && pageCount < MAX_PAGES) {
        currentUrl = data.links.next;
      } else {
        break;
      }
    }

    console.log(
      `[EONET] Fetched ${allEvents.length} events across ${pageCount} page(s)`
    );

    return allEvents;
  } catch (error: any) {
    if (error?.name === 'AbortError' || String(error?.message || '').includes('aborted')) {
      return allEvents; // partial results on cancel
    }
    console.error('[EONET] Fetch error:', error);
    throw error;
  }
}
