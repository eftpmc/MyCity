/**
 * NASA EONET Event Types
 */

export interface EonetGeometry {
  date: string;
  type: 'Point' | 'Polygon';
  coordinates: number[]; // [lon, lat] for Point, [[lon,lat],...] for Polygon
  magnitudeValue?: number;
  magnitudeUnit?: string;
}

export interface EonetCategory {
  id: string;
  title: string;
}

export interface EonetSource {
  id: string;
  url: string;
}

export interface EonetEvent {
  id: string;
  title: string;
  description: string | null;
  link: string;
  closed: string | null;
  categories: EonetCategory[];
  sources: EonetSource[];
  geometry: EonetGeometry[];
}

export interface EonetResponse {
  title: string;
  description: string;
  link: string;
  events: EonetEvent[];
}

export interface EonetLinks {
  next?: string;
  prev?: string;
}

export interface EonetPaginatedResponse extends EonetResponse {
  links?: EonetLinks;
}

export interface EventQuery {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  categories?: string[];
  bbox?: [number, number, number, number]; // [west, south, east, north]
  limit?: number;
  status?: 'open' | 'closed' | 'all';
}
