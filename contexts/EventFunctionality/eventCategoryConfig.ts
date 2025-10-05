/**
 * Event Category Configuration
 * Maps NASA EONET category slugs to visual properties (colors, emojis, etc.)
 */

export type CategorySlug = 
  | 'dustHaze'
  | 'manmade'
  | 'seaLakeIce'
  | 'severeStorms'
  | 'snow'
  | 'volcanoes'
  | 'waterColor'
  | 'floods'
  | 'wildfires';

export interface CategoryConfig {
  slug: CategorySlug;
  color: string;
  emoji: string;
  label: string;
}

export const CATEGORY_CONFIGS: Record<CategorySlug, CategoryConfig> = {
  dustHaze: {
    slug: 'dustHaze',
    color: '#D2B48C', // tan
    emoji: '🌫️',
    label: 'Dust and Haze',
  },
  manmade: {
    slug: 'manmade',
    color: '#808080', // gray
    emoji: '🏭',
    label: 'Manmade',
  },
  seaLakeIce: {
    slug: 'seaLakeIce',
    color: '#87CEEB', // sky blue
    emoji: '🧊',
    label: 'Sea and Lake Ice',
  },
  severeStorms: {
    slug: 'severeStorms',
    color: '#4B0082', // indigo
    emoji: '⛈️',
    label: 'Severe Storms',
  },
  snow: {
    slug: 'snow',
    color: '#FFFFFF', // white
    emoji: '❄️',
    label: 'Snow',
  },
  volcanoes: {
    slug: 'volcanoes',
    color: '#FF4500', // orange red
    emoji: '🌋',
    label: 'Volcanoes',
  },
  waterColor: {
    slug: 'waterColor',
    color: '#00CED1', // dark turquoise
    emoji: '💧',
    label: 'Water Color',
  },
  floods: {
    slug: 'floods',
    color: '#1E90FF', // dodger blue
    emoji: '🌊',
    label: 'Floods',
  },
  wildfires: {
    slug: 'wildfires',
    color: '#FF6347', // tomato red
    emoji: '🔥',
    label: 'Wildfires',
  },
};

// Helper map to match by title (case-insensitive)
const TITLE_TO_SLUG_MAP: Record<string, CategorySlug> = {
  'dust and haze': 'dustHaze',
  'manmade': 'manmade',
  'sea and lake ice': 'seaLakeIce',
  'severe storms': 'severeStorms',
  'snow': 'snow',
  'volcanoes': 'volcanoes',
  'water color': 'waterColor',
  'floods': 'floods',
  'wildfires': 'wildfires',
};

/**
 * Get the category config for an event
 * Tries multiple matching strategies: id, slug, title
 * Falls back to wildfires config if category not found
 */
export function getCategoryConfig(event: { categories?: Array<{ id?: number | string; slug?: string; title?: string }> }): CategoryConfig {
  if (!event.categories || event.categories.length === 0) {
    console.warn('[EventMarker] No categories found for event');
    return CATEGORY_CONFIGS.wildfires; // default
  }

  const category = event.categories[0];
  
  // Strategy 1: Try matching by slug
  if (category.slug && CATEGORY_CONFIGS[category.slug as CategorySlug]) {
    return CATEGORY_CONFIGS[category.slug as CategorySlug];
  }

  // Strategy 2: Try matching by id (some APIs use numeric IDs)
  const idToSlugMap: Record<string | number, CategorySlug> = {
    6: 'dustHaze',
    16: 'manmade', 
    15: 'seaLakeIce',
    10: 'severeStorms',
    14: 'snow',
    12: 'volcanoes',
    17: 'waterColor',
    9: 'floods',
    8: 'wildfires',
  };
  
  if (category.id && idToSlugMap[category.id]) {
    return CATEGORY_CONFIGS[idToSlugMap[category.id]];
  }

  // Strategy 3: Try matching by title (case-insensitive)
  if (category.title) {
    const titleLower = category.title.toLowerCase();
    const matchedSlug = TITLE_TO_SLUG_MAP[titleLower];
    if (matchedSlug) {
      return CATEGORY_CONFIGS[matchedSlug];
    }
  }

  // Fallback
  console.warn('[EventMarker] Could not match category:', category);
  return CATEGORY_CONFIGS.wildfires;
}

/**
 * Get pin color for an event
 */
export function getEventPinColor(event: { categories?: Array<{ id?: number | string; slug?: string; title?: string }> }): string {
  return getCategoryConfig(event).color;
}

/**
 * Get emoji for an event
 */
export function getEventEmoji(event: { categories?: Array<{ id?: number | string; slug?: string; title?: string }> }): string {
  return getCategoryConfig(event).emoji;
}

