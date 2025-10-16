/**
 * Configuration for the nearby comments feature
 */

export interface CommentsConfig {
  /** Maximum distance in miles to consider a city as "nearby" */
  maxProximityMiles: number;
  
  /** Maximum number of nearby cities to include */
  maxNearbyCities: number;
  
  /** Maximum number of nearby comments to display */
  maxNearbyComments: number;
  
  /** Whether to show nearby comments by default */
  showNearbyComments: boolean;
  
  /** Whether to show distance information in nearby comments */
  showDistanceInfo: boolean;
}

export const DEFAULT_COMMENTS_CONFIG: CommentsConfig = {
  maxProximityMiles: 10,
  maxNearbyCities: 5,
  maxNearbyComments: 20,
  showNearbyComments: true,
  showDistanceInfo: true,
};

/**
 * Get the current comments configuration
 * In the future, this could be loaded from user preferences or settings
 */
export function getCommentsConfig(): CommentsConfig {
  return DEFAULT_COMMENTS_CONFIG;
}

/**
 * Update the comments configuration
 * In the future, this could save to user preferences
 */
export function updateCommentsConfig(config: Partial<CommentsConfig>): CommentsConfig {
  return {
    ...DEFAULT_COMMENTS_CONFIG,
    ...config,
  };
}

