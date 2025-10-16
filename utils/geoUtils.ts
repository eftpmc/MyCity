/**
 * Geographic utility functions for calculating distances and finding nearby cities
 */

import { City } from '@/types';

/**
 * Calculate the distance between two points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find cities within a specified radius of a given city
 * @param targetCity The city to find nearby cities for
 * @param allCities Array of all cities to search through
 * @param radiusMiles Radius in miles (default: 10)
 * @param maxResults Maximum number of nearby cities to return (default: 5)
 * @returns Array of nearby cities with distance information
 */
export function findNearbyCities(
  targetCity: City,
  allCities: City[],
  radiusMiles: number = 10,
  maxResults: number = 5
): Array<City & { distance: number }> {
  const targetLat = parseFloat(targetCity.lat);
  const targetLng = parseFloat(targetCity.lng);
  
  const nearbyCities: Array<City & { distance: number }> = [];
  
  for (const city of allCities) {
    // Skip the target city itself
    if (city.city === targetCity.city && city.state_id === targetCity.state_id) {
      continue;
    }
    
    const cityLat = parseFloat(city.lat);
    const cityLng = parseFloat(city.lng);
    
    const distance = calculateDistance(targetLat, targetLng, cityLat, cityLng);
    
    if (distance <= radiusMiles) {
      nearbyCities.push({
        ...city,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
      });
    }
  }
  
  // Sort by distance and return top results
  return nearbyCities
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults);
}

/**
 * Get a formatted distance string
 * @param distance Distance in miles
 * @returns Formatted string (e.g., "2.3 mi", "0.8 mi")
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 10) / 10} mi`;
  }
  return `${Math.round(distance * 10) / 10} mi`;
}

/**
 * Get a human-readable location description for nearby cities
 * @param city The city object
 * @param distance Distance in miles
 * @returns Formatted string (e.g., "San Francisco, CA (2.3 mi away)")
 */
export function getNearbyCityDescription(city: City, distance: number): string {
  return `${city.city}, ${city.state_id} (${formatDistance(distance)} away)`;
}

