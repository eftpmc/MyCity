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

/**
 * Get the category config for an event
 * Falls back to wildfires config if category not found
 */
export function getCategoryConfig(event: { categories?: Array<{ slug?: string }> }): CategoryConfig {
  if (!event.categories || event.categories.length === 0) {
    return CATEGORY_CONFIGS.wildfires; // default
  }

  const slug = event.categories[0]?.slug as CategorySlug;
  return CATEGORY_CONFIGS[slug] || CATEGORY_CONFIGS.wildfires;
}

/**
 * Get pin color for an event
 */
export function getEventPinColor(event: { categories?: Array<{ slug?: string }> }): string {
  return getCategoryConfig(event).color;
}

/**
 * Get emoji for an event
 */
export function getEventEmoji(event: { categories?: Array<{ slug?: string }> }): string {
  return getCategoryConfig(event).emoji;
}

