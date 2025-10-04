/**
 * Event Filter State and Utilities
 */

import { Region } from 'react-native-maps';

export interface FilterState {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  categories: string[];
  viewportOnly: boolean;
}

/**
 * Default category IDs from NASA EONET
 */
export const DEFAULT_CATEGORIES = [
  'dustHaze',
  'manmade',
  'seaLakeIce',
  'severeStorms',
  'snow',
  'volcanoes',
  'waterColor',
  'floods',
  'wildfires',
];

/**
 * Category display names
 */
export const CATEGORY_LABELS: Record<string, string> = {
  dustHaze: 'Dust & Haze',
  manmade: 'Manmade',
  seaLakeIce: 'Sea & Lake Ice',
  severeStorms: 'Severe Storms',
  snow: 'Snow',
  volcanoes: 'Volcanoes',
  waterColor: 'Water Color',
  floods: 'Floods',
  wildfires: 'Wildfires',
};

/**
 * Converts a map region to a bounding box [west, south, east, north]
 */
export function regionToBbox(region: Region): [number, number, number, number] {
  const west = region.longitude - region.longitudeDelta / 2;
  const east = region.longitude + region.longitudeDelta / 2;
  const south = region.latitude - region.latitudeDelta / 2;
  const north = region.latitude + region.latitudeDelta / 2;

  return [west, south, east, north];
}

/**
 * Creates a default filter state with date range from 5 years ago to today
 */
export function createDefaultFilters(): FilterState {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 5);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    categories: DEFAULT_CATEGORIES,
    viewportOnly: false,
  };
}

