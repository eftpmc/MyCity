# Integration Guide: Event Filtering & Custom Icons

## ✅ What's Already Done

1. **EventContext.tsx** - Full EONET API integration with filtering, debouncing, and pagination
2. **EventsFilter.tsx** - Filter UI component (date range, categories, viewport toggle)
3. **eventCategoryConfig.ts** - Category icons, colors, and helpers

---

## 🔧 Changes Needed

### 1. Update `app/(stack)/(drawer)/index.tsx`

**Current code (line 34):**
```typescript
const { events } = useEvents();
```

**Change to:**
```typescript
const { events, filters, setFilters, setRegion } = useEvents();
const [showFilters, setShowFilters] = useState(false);
```

**Add this import at the top:**
```typescript
import { EventsFilter } from "@/contexts/EventFunctionality/EventsFilter";
import { Modal } from "react-native";
```

**Update MapDisplay (line 87-96) to track region:**
```typescript
<MapDisplay
  mapRef={mapRef}
  cities={cities}
  events={events}
  activeLayer={activeLayer}
  onFlyToCity={flyToCity}
  onRegionChange={updateNearestCity}
  onDeselectCity={() => setSelectedCity(null)}
  setZoomLevel={setZoomLevel}
  onRegionChangeComplete={(region) => setRegion(region)} // ⬅️ ADD THIS
/>
```

**Add Filter Button before closing View (around line 128):**
```typescript
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(true)}
      >
        <Text style={styles.filterButtonText}>🔍 Filters</Text>
      </TouchableOpacity>

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <EventsFilter value={filters} onChange={setFilters} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View> {/* closing View */}
```

**Add these styles:**
```typescript
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  filterButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4A90E2',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'transparent',
    padding: 20,
    paddingBottom: 40,
  },
  closeButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

### 2. Update `components/MapDisplay.tsx`

**Add imports at top:**
```typescript
import { getEventPinColor } from '@/contexts/EventFunctionality/eventCategoryConfig';
```

**Update Props interface (add onRegionChangeComplete):**
```typescript
interface Props {
  mapRef: React.RefObject<MapView | null>;
  cities: City[];
  events: any[];
  activeLayer: any;
  onFlyToCity: (city: City) => void;
  onRegionChange: (lat: number, lng: number) => void;
  onDeselectCity: () => void;
  setZoomLevel: (z: number) => void;
  onRegionChangeComplete?: (region: Region) => void; // ⬅️ ADD THIS
}
```

**Update MapDisplay function signature:**
```typescript
export default function MapDisplay({
  mapRef,
  cities,
  events,
  activeLayer,
  onFlyToCity,
  onRegionChange,
  onDeselectCity,
  setZoomLevel,
  onRegionChangeComplete, // ⬅️ ADD THIS
}: Props) {
```

**Update onRegionChangeComplete handler (line 37-42):**
```typescript
onRegionChangeComplete={(region: Region) => {
  setZoomLevel(region.latitudeDelta);
  if (region.latitudeDelta < 2) {
    onRegionChange(region.latitude, region.longitude);
  }
  // Track region for event filtering
  if (onRegionChangeComplete) {
    onRegionChangeComplete(region);
  }
}}
```

**Replace the event marker rendering (lines 46-66) with:**
```typescript
{events.map((ev, i) => {
  const geom = Array.isArray(ev.geometry)
    ? ev.geometry.find(
        (g: EonetGeometry) =>
          Array.isArray(g.coordinates) && g.coordinates.length >= 2
      )
    : null;

  if (!geom || !geom.coordinates) return null;
  const [lon, lat] = geom.coordinates;

  return (
    <Marker
      key={`event-${i}`}
      coordinate={{ latitude: lat, longitude: lon }}
      title={ev.title}
      description={ev.categories?.map((c: any) => c.title).join(', ')}
      pinColor={getEventPinColor(ev)} // ⬅️ DYNAMIC COLOR
    />
  );
})}
```

---

## 🎨 What This Gives You

### 1. **Category Filtering**
- Open the filter modal (bottom-right button)
- Toggle categories on/off
- Only selected categories will appear on the map
- Filters wildfires to see other events clearly

### 2. **Date Range Filtering**
- Set start/end dates in YYYY-MM-DD format
- Only events within that range will be fetched

### 3. **Viewport-Only Mode**
- Toggle "Viewport Only" in filters
- When ON: only events in the current map view are fetched
- Pan/zoom automatically refetches (debounced 450ms)
- Limits results to manageable numbers

### 4. **Category-Specific Colors**
- 🔥 Wildfires: Red (#FF6347)
- 🌋 Volcanoes: Orange-red (#FF4500)
- 🌊 Floods: Blue (#1E90FF)
- ⛈️ Severe Storms: Indigo (#4B0082)
- ❄️ Snow: White (#FFFFFF)
- 🧊 Sea/Lake Ice: Sky blue (#87CEEB)
- 💧 Water Color: Turquoise (#00CED1)
- 🌫️ Dust/Haze: Tan (#D2B48C)
- 🏭 Manmade: Gray (#808080)

---

## 🧪 Testing

1. **Filter out wildfires:**
   - Open filters
   - Deselect "Wildfires"
   - Close modal
   - Map should only show non-wildfire events

2. **Viewport filtering:**
   - Enable "Viewport Only"
   - Pan/zoom around the map
   - Events should update to match the visible area

3. **Date filtering:**
   - Set start/end dates
   - Only events in that range will appear

---

## 📝 Optional Enhancements

### Add Event Counter
Add this before the filter button in index.tsx:

```typescript
<View style={styles.counterPill}>
  <Text style={styles.counterText}>Events: {events.length}</Text>
</View>
```

Styles:
```typescript
counterPill: {
  position: 'absolute',
  top: 60,
  alignSelf: 'center',
  backgroundColor: 'rgba(0,0,0,0.75)',
  borderRadius: 20,
  paddingHorizontal: 16,
  paddingVertical: 8,
},
counterText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600',
},
```

### Use Custom Marker Images (Advanced)
Instead of pinColor, use custom images for each category:

```typescript
import { Image } from 'react-native';

<Marker
  key={`event-${i}`}
  coordinate={{ latitude: lat, longitude: lon }}
  title={ev.title}
  description={ev.categories?.map((c: any) => c.title).join(', ')}
>
  <Image
    source={require(`@/assets/icons/${getCategoryConfig(ev).slug}.png`)}
    style={{ width: 32, height: 32 }}
  />
</Marker>
```

---

## ❓ Questions?

The filtering logic is all handled in `EventContext.tsx` - you just need to:
1. Pass `setRegion` to track map movements
2. Add the filter UI somewhere accessible
3. Use the color helpers for custom pins

Everything else (debouncing, pagination, bbox calculation) is automatic!

