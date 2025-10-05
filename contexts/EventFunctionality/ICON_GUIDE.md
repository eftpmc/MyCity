# Event Category Icons Guide

## 🎨 Custom Map Markers

Each natural disaster/weather event category now displays with a unique icon on the map!

---

## 📍 Icon Reference

### 🔥 **Wildfires**
- **Icon:** 🔥 Fire emoji
- **Background Color:** Tomato Red (#FF6347)
- **Border:** White (2px)
- **Size:** 36x36px circle

### 🌋 **Volcanoes**
- **Icon:** 🌋 Volcano emoji
- **Background Color:** Orange Red (#FF4500)
- **Border:** White (2px)
- **Size:** 36x36px circle

### 🌊 **Floods**
- **Icon:** 🌊 Water wave emoji
- **Background Color:** Dodger Blue (#1E90FF)
- **Border:** White (2px)
- **Size:** 36x36px circle

### ⛈️ **Severe Storms**
- **Icon:** ⛈️ Storm emoji
- **Background Color:** Indigo (#4B0082)
- **Border:** White (2px)
- **Size:** 36x36px circle

### ❄️ **Snow**
- **Icon:** ❄️ Snowflake emoji
- **Background Color:** White (#FFFFFF)
- **Border:** White (2px)
- **Size:** 36x36px circle

### 🧊 **Sea and Lake Ice**
- **Icon:** 🧊 Ice cube emoji
- **Background Color:** Sky Blue (#87CEEB)
- **Border:** White (2px)
- **Size:** 36x36px circle

### 💧 **Water Color**
- **Icon:** 💧 Droplet emoji
- **Background Color:** Dark Turquoise (#00CED1)
- **Border:** White (2px)
- **Size:** 36x36px circle

### 🌫️ **Dust and Haze**
- **Icon:** 🌫️ Fog emoji
- **Background Color:** Tan (#D2B48C)
- **Border:** White (2px)
- **Size:** 36x36px circle

### 🏭 **Manmade**
- **Icon:** 🏭 Factory emoji
- **Background Color:** Gray (#808080)
- **Border:** White (2px)
- **Size:** 36x36px circle

---

## 🎯 Design Features

### Visual Hierarchy
- **36x36px circular icons** - Easy to tap on mobile
- **White border (2px)** - Stands out against any map background
- **Category-specific color** - Quick visual identification
- **Emoji icon** - Universal, no localization needed

### Accessibility
- **Shadow on iOS** - Depth and elevation
- **Elevation on Android** - Material design shadow
- **Center-anchored** - Precise location indication
- **Title + Description** - Tap to see event details

### Performance
- **Lightweight** - Uses native emoji, no image loading
- **Renders fast** - Simple View/Text components
- **Scales well** - Works with hundreds of markers

---

## 📱 How It Looks

### On the Map:
```
     🔥        🌋        🌊
   Wildfire  Volcano   Flood

     ⛈️        ❄️        🧊
    Storm     Snow      Ice

     💧        🌫️        🏭
   Water     Dust    Manmade
```

Each icon has:
- Colored circular background
- White border for contrast
- Shadow for depth
- Emoji centered inside

---

## 🧪 Testing the Icons

1. **Run your app**
2. **Open the map** - you'll see custom icons instead of pins
3. **Open filters** and deselect all except one category
4. **Verify the icon matches:**
   - Wildfires show 🔥 on red background
   - Volcanoes show 🌋 on orange-red background
   - Floods show 🌊 on blue background
   - etc.

---

## 🔧 Customization

Want to change the icons? Edit `eventCategoryConfig.ts`:

```typescript
export const CATEGORY_CONFIGS: Record<CategorySlug, CategoryConfig> = {
  wildfires: {
    slug: 'wildfires',
    color: '#FF6347',
    emoji: '🔥',  // ← Change this emoji
    label: 'Wildfires',
  },
  // ... other categories
};
```

Want to change the size? Edit `EventMarker.tsx`:

```typescript
iconBackground: {
  width: 36,  // ← Change width
  height: 36, // ← Change height
  borderRadius: 18, // ← Keep as half of width/height for circle
  // ...
},
```

---

## ✨ Benefits

### Before (Standard Pins):
- ❌ All events looked similar
- ❌ Hard to distinguish event types at a glance
- ❌ Only color difference (subtle)

### After (Custom Icons):
- ✅ Instantly recognize event type by icon
- ✅ Beautiful, polished appearance
- ✅ Professional mapping experience
- ✅ Color + Icon = double encoding

---

## 📊 Icon Legend (for UI)

Want to add a legend? Here's the data structure:

```typescript
import { CATEGORY_CONFIGS } from '@/contexts/EventFunctionality/eventCategoryConfig';

// In your component:
Object.values(CATEGORY_CONFIGS).map((config) => (
  <View key={config.slug}>
    <Text style={{ fontSize: 20 }}>{config.emoji}</Text>
    <Text>{config.label}</Text>
  </View>
));
```

---

## 🎉 Result

Your map now displays professional, category-specific icons for each natural disaster event! 🗺️✨

**Example view:**
- Zoom into California → See 🔥 wildfire icons
- Zoom to Pacific Northwest → See 🌋 volcano icons  
- Zoom to Gulf Coast → See 🌊 flood icons
- Zoom to Midwest → See ⛈️ storm icons

Each event is now visually distinct and easy to identify at a glance!

