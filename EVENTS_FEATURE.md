# NASA Worldview-Style Events Feature

A complete implementation of NASA EONET (Earth Observatory Natural Event Tracker) integration with interactive filtering and mapping capabilities.

## 🎯 Overview

This feature brings NASA's natural event tracking directly into your React Native app. Users can visualize and filter natural disasters and events (wildfires, floods, volcanoes, etc.) on an interactive map with a clean, dark-themed UI.

## ✨ Features

- **Real-time Event Data**: Fetches natural events from NASA EONET v3 API
- **Interactive Map**: View events on Apple Maps (iOS) or Google Maps (Android)
- **Advanced Filtering**:
  - Date range selection (start/end dates)
  - Category filtering (9 categories: floods, wildfires, volcanoes, etc.)
  - Viewport-only toggle (show events in visible region only)
- **Debounced Fetching**: 400ms debounce prevents excessive API calls
- **Event Details**: Tap markers to view detailed event information
- **Timeline Visualization**: See event distribution over time
- **Live Counter**: Real-time event count with loading states
- **Pagination**: Automatically fetches up to 3 pages (300 events max)

## 📁 File Structure

```
src/
├── types/
│   └── events.ts                    # TypeScript interfaces for EONET data
├── services/
│   └── eonet.ts                     # API layer (URL builder + pagination)
├── features/events/
│   ├── filters.ts                   # Filter state + utilities
│   ├── useEvents.ts                 # Custom hook with debounced fetch
│   └── EventsFilter.tsx             # Filter UI component
├── components/
│   ├── CategoryIcon.tsx             # Category-specific icons
│   ├── EventDetailsSheet.tsx        # Event details bottom sheet
│   └── TimelineBar.tsx              # Timeline visualization
├── screens/
│   └── EventsMapScreen.tsx          # Main screen
└── __tests__/
    ├── eonet-url.test.ts            # URL builder tests
    └── eonet-fetch.test.ts          # API fetch tests
```

## 🚀 Usage

### Basic Integration

```typescript
import EventsMapScreen from '@/src/screens/EventsMapScreen';

export default function App() {
  return <EventsMapScreen />;
}
```

### Custom Filters

```typescript
import { useState } from 'react';
import { EventsFilter } from '@/src/features/events/EventsFilter';
import { createDefaultFilters } from '@/src/features/events/filters';

function MyComponent() {
  const [filters, setFilters] = useState(createDefaultFilters());

  return (
    <EventsFilter 
      filters={filters} 
      onChange={setFilters}
    />
  );
}
```

### Using the Hook Directly

```typescript
import { useEvents } from '@/src/features/events/useEvents';

function MyComponent() {
  const query = {
    start: '2020-10-04',
    end: '2025-10-04',
    categories: ['floods', 'wildfires'],
    status: 'all',
  };

  const { data, loading, error, refetch } = useEvents(query);

  // Use the events data...
}
```

## 🎨 UI Components

### EventsMapScreen
Main screen with map, markers, and overlays.

**Key Props**: None (fully self-contained)

### EventsFilter
Bottom sheet for filtering events.

```typescript
<EventsFilter
  filters={filters}
  onChange={(newFilters) => setFilters(newFilters)}
  onClose={() => console.log('Filter closed')}
/>
```

### EventDetailsSheet
Shows detailed information about a selected event.

```typescript
<EventDetailsSheet
  event={selectedEvent}
  onClose={() => setSelectedEvent(null)}
/>
```

### TimelineBar
Visualizes event distribution over time.

```typescript
<TimelineBar
  events={events}
  startDate="2020-10-04"
  endDate="2025-10-04"
/>
```

### CategoryIcon
Displays category-specific icons.

```typescript
<CategoryIcon 
  categoryId="wildfires" 
  size={24} 
  color="#2dd4bf" 
/>
```

## 🔧 API Reference

### EONET Service

#### `fetchEvents(query: EventQuery): Promise<EonetEvent[]>`

Fetches events from NASA EONET API with pagination.

**Parameters:**
- `query.start` (string): Start date in YYYY-MM-DD format
- `query.end` (string): End date in YYYY-MM-DD format
- `query.categories` (string[]): Array of category IDs (optional)
- `query.bbox` ([number, number, number, number]): Bounding box [west, south, east, north] (optional)
- `query.limit` (number): Max results per page (default: 100)
- `query.status` ('open' | 'closed' | 'all'): Event status (default: 'all')

**Returns:** Array of EONET events (up to 3 pages merged)

**Example:**
```typescript
const events = await fetchEvents({
  start: '2024-01-01',
  end: '2025-01-01',
  categories: ['wildfires', 'floods'],
  bbox: [-180, -90, 180, 90],
});
```

#### `buildEonetUrl(query: EventQuery): string`

Builds a properly formatted EONET API URL.

### Filters Utilities

#### `regionToBbox(region: Region): [number, number, number, number]`

Converts a react-native-maps Region to a bounding box.

```typescript
const bbox = regionToBbox({
  latitude: 37.78,
  longitude: -122.4,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
});
// Returns: [-122.45, 37.73, -122.35, 37.83]
```

#### `createDefaultFilters(): FilterState`

Creates default filter state (last 5 years, all categories).

## 🌍 Available Categories

| Category ID | Display Name | Icon |
|------------|--------------|------|
| `wildfires` | Wildfires | 🔥 |
| `floods` | Floods | 💧 |
| `volcanoes` | Volcanoes | 🌋 |
| `severeStorms` | Severe Storms | ⚠️ |
| `dustHaze` | Dust & Haze | ☁️ |
| `snow` | Snow | ❄️ |
| `waterColor` | Water Color | 🌊 |
| `seaLakeIce` | Sea & Lake Ice | ✨ |
| `manmade` | Manmade | 🏭 |

## 🎨 Theming

The UI uses a consistent dark theme:

- **Primary Color**: `#2dd4bf` (Teal)
- **Background**: `rgba(0, 0, 0, 0.65)` (Translucent black)
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#9ca3af`
- **Error Color**: `#ef4444`

### Customizing Colors

Edit the styles in each component:

```typescript
// Example: Change primary color
const styles = StyleSheet.create({
  categoryActive: {
    backgroundColor: '#your-color', // Change from #2dd4bf
    borderColor: '#your-color',
  },
});
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

### Test Coverage

- ✅ URL building with all parameter combinations
- ✅ Event fetching with success scenarios
- ✅ Pagination (up to 3 pages)
- ✅ Error handling (network errors, API errors)
- ✅ Empty category arrays
- ✅ Bounding box formatting

## 🔄 Behavior Details

### Debouncing
All filter changes and map movements are debounced by 400ms to prevent excessive API calls.

### Pagination
The API automatically fetches up to 3 pages if available, merging results into a single array.

### Viewport Filtering
When "viewport-only" is enabled:
1. Map panning/zooming triggers debounced refetch
2. Bounding box is calculated from visible region
3. Only events within the box are returned

### Event Selection
Tapping a marker:
1. Opens the EventDetailsSheet bottom sheet
2. Displays full event information
3. Provides links to sources and EONET

## 📱 Platform Compatibility

- ✅ **iOS**: Uses Apple Maps via `PROVIDER_DEFAULT`
- ✅ **Android**: Uses Google Maps via `PROVIDER_DEFAULT`
- ✅ **Expo Go**: Fully compatible
- ✅ **Dev Build**: Fully compatible
- ⚠️ **Web**: Maps not supported (use conditional rendering)

### Web Compatibility

To make the feature web-safe:

```typescript
import { Platform } from 'react-native';

export default function MyApp() {
  if (Platform.OS === 'web') {
    return <WebAlternativeScreen />;
  }
  return <EventsMapScreen />;
}
```

## 🐛 Troubleshooting

### "Map not displaying"
- Ensure `react-native-maps` is properly installed
- Run `npx expo prebuild` for dev builds
- Check platform-specific setup in the Expo docs

### "Events not loading"
- Check internet connection
- Verify date range is valid
- Check console for API error messages
- Ensure date format is YYYY-MM-DD

### "DateTimePicker not showing"
- Ensure `@react-native-community/datetimepicker` is installed
- On Android, picker shows as modal by default

### "Bottom sheet not working"
- Ensure `@gorhom/bottom-sheet` is installed
- Wrap app in `GestureHandlerRootView` from `react-native-gesture-handler`

## 🔗 API Documentation

NASA EONET v3 API: https://eonet.gsfc.nasa.gov/docs/v3

## 📄 License

This feature integrates with NASA's publicly available EONET API. NASA data is in the public domain.

## 🤝 Contributing

To extend this feature:

1. **Add new filters**: Modify `FilterState` in `filters.ts`
2. **Change map styling**: Edit MapView props in `EventsMapScreen.tsx`
3. **Add event types**: Update CATEGORY_LABELS in `filters.ts`
4. **Customize UI**: Modify StyleSheet in component files

## 📊 Performance Tips

1. **Limit date ranges**: Smaller ranges = faster responses
2. **Use viewport filtering**: Reduces data when zoomed in
3. **Deselect categories**: Fewer categories = fewer results
4. **Adjust debounce**: Increase `DEBOUNCE_MS` for slower connections

## 🎯 Acceptance Checklist

- ✅ Changing date range updates API call
- ✅ Toggling categories changes API `category=` param
- ✅ Moving map with viewport-only ON updates results
- ✅ Map markers reflect fetched events
- ✅ Works in Expo Go on iOS (Apple Maps)
- ✅ Works in Expo Go on Android (Google Maps)
- ✅ No unhandled rejections
- ✅ Graceful error handling
- ✅ Event counter updates live
- ✅ Timeline shows event distribution
- ✅ Event details sheet opens on marker tap
- ✅ All tests pass

