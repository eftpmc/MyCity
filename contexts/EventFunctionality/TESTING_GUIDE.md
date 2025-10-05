# Testing Guide: Event Filtering System

## ✅ What Was Completed

### 1. **EventContext.tsx** ✅
- Full NASA EONET v3 integration
- Date range filtering
- Category filtering
- Viewport bbox filtering
- Debounced refetch (450ms)
- Pagination (up to 3 pages)
- Request cancellation

### 2. **index.tsx** ✅
- Imports EventsFilter component
- Gets `filters`, `setFilters`, `setRegion` from context
- Tracks region changes with `onRegionChangeComplete`
- Added filter button (bottom-right)
- Added event counter pill (top-center)
- Added filter modal

### 3. **MapDisplay.tsx** ✅
- Uses `getEventPinColor()` for category-specific colors
- Passes region changes to context
- Event markers now show different colors per category

### 4. **eventCategoryConfig.ts** ✅
- Category-to-color mapping
- Helper functions for pin colors

---

## 🧪 How to Test

### Test 1: Basic Filtering - Filter Out Wildfires

**Goal:** Reduce clutter by hiding wildfire events

1. **Start the app** and open the map
2. **Check the counter** at the top - note the total events (e.g., "Events: 47")
3. **Click the "🔍 Filters" button** at the bottom-right
4. **Scroll to Categories** section
5. **Tap "Wildfires"** to deselect it (pill should turn gray)
6. **Tap "Close"** at the bottom
7. **Observe:** 
   - Counter should decrease (e.g., "Events: 12")
   - Red wildfire markers should disappear
   - Other event types remain visible

**Expected Result:** ✅ Only non-wildfire events are shown

---

### Test 2: Category-Specific Colors

**Goal:** Verify each event type has a unique color

1. **Open Filters**
2. **Deselect all categories except one** (e.g., only "Volcanoes")
3. **Close filters**
4. **Observe markers:**
   - 🌋 Volcanoes: Orange-red (#FF4500)
5. **Repeat for other categories:**
   - 🔥 Wildfires: Red (#FF6347)
   - 🌊 Floods: Blue (#1E90FF)
   - ⛈️ Severe Storms: Indigo (#4B0082)
   - ❄️ Snow: White (#FFFFFF)
   - 🧊 Sea/Lake Ice: Sky blue (#87CEEB)
   - 💧 Water Color: Turquoise (#00CED1)
   - 🌫️ Dust/Haze: Tan (#D2B48C)
   - 🏭 Manmade: Gray (#808080)

**Expected Result:** ✅ Each category has a distinct pin color

---

### Test 3: Viewport-Only Filtering

**Goal:** Only show events in the visible map area

1. **Open Filters**
2. **Enable "Viewport Only" toggle** (should turn blue)
3. **Close filters**
4. **Pan/zoom to California**
5. **Wait 450ms** (debounce delay)
6. **Check the console** - you should see:
   ```
   [EONET] Fetching events: https://eonet.gsfc.nasa.gov/api/v3/events?status=all&...&bbox=-125,32,-114,42&...
   ```
7. **Observe:** Only events within California's bbox appear
8. **Pan to Texas**
9. **Wait 450ms**
10. **Observe:** Events update to show Texas events

**Expected Result:** ✅ Events dynamically update based on visible map area

---

### Test 4: Date Range Filtering

**Goal:** Show only events from a specific time period

1. **Open Filters**
2. **Change start date** to `2024-01-01`
3. **Change end date** to `2024-12-31`
4. **Close filters**
5. **Check console** - URL should include:
   ```
   start=2024-01-01&end=2024-12-31
   ```
6. **Observe:** Only events from 2024 are shown

**Expected Result:** ✅ Only events within the date range appear

---

### Test 5: Debounced Refetch

**Goal:** Verify smooth performance when panning/zooming

1. **Enable "Viewport Only"**
2. **Rapidly pan/zoom the map** (don't pause)
3. **Observe:**
   - Events don't update immediately
   - Updates happen ~450ms after you stop moving
   - Counter shows loading briefly
4. **Check console:**
   - Only one request after you stop moving
   - Previous requests are cancelled

**Expected Result:** ✅ Smooth performance, no request spam

---

### Test 6: Pagination

**Goal:** Verify multiple pages are fetched

1. **Open Filters**
2. **Set date range to 1 year** (e.g., 2024-01-01 to 2024-12-31)
3. **Select all categories**
4. **Disable "Viewport Only"** (global search)
5. **Close filters**
6. **Check console:**
   ```
   [EONET] Fetching events: https://...
   [EONET] Following page 2: https://...
   [EONET] Following page 3: https://...
   [EONET] Fetched 287 events across 3 page(s)
   ```

**Expected Result:** ✅ Up to 3 pages are automatically fetched

---

### Test 7: Error Handling

**Goal:** Verify graceful error handling

1. **Turn off WiFi/Data**
2. **Change a filter** (trigger refetch)
3. **Observe:**
   - Counter shows "Events: N" (previous data)
   - Console shows error message
4. **Turn WiFi/Data back on**
5. **Change filter again**
6. **Observe:** Events load successfully

**Expected Result:** ✅ App doesn't crash, errors are logged

---

### Test 8: Multiple Categories

**Goal:** Combine multiple event types

1. **Open Filters**
2. **Select only "Wildfires", "Floods", and "Volcanoes"**
3. **Close filters**
4. **Observe:**
   - Red markers (wildfires)
   - Blue markers (floods)
   - Orange-red markers (volcanoes)
5. **Check console:**
   ```
   category=wildfires,floods,volcanoes
   ```

**Expected Result:** ✅ Multiple categories shown with correct colors

---

## 🎯 Key Features to Verify

| Feature | Status | How to Test |
|---------|--------|-------------|
| Category filtering | ✅ | Deselect "Wildfires" → they disappear |
| Category-specific colors | ✅ | Each event type has unique pin color |
| Viewport-only mode | ✅ | Enable → pan map → events update |
| Date range filtering | ✅ | Set dates → only events in range appear |
| Debounced refetch | ✅ | Pan map → wait 450ms → events update |
| Event counter | ✅ | Top pill shows "Events: N" |
| Pagination | ✅ | Console shows up to 3 pages fetched |
| Request cancellation | ✅ | Rapid panning doesn't spam requests |
| Select All/Deselect All | ✅ | Quick toggle for all categories |

---

## 🐛 Common Issues & Solutions

### Issue: Events not updating when panning
**Solution:** Make sure "Viewport Only" is enabled in filters

### Issue: Too many wildfire events
**Solution:** Open filters and deselect "Wildfires" category

### Issue: No events showing
**Solution:** 
- Check date range (might be too narrow)
- Check categories (at least one must be selected)
- Check console for API errors

### Issue: Colors not showing correctly
**Solution:** Verify events have valid category data in `event.categories[0].slug`

---

## 📊 Expected Behavior Summary

### When you change filters:
1. 450ms delay (debouncing)
2. Console logs the API URL
3. Counter shows loading briefly
4. Events update
5. Counter shows new count

### When you pan/zoom (with Viewport Only ON):
1. Region is tracked
2. 450ms delay (debouncing)
3. Bbox is calculated
4. API fetches events in new bbox
5. Markers update

### When you deselect a category:
1. Immediate filter update
2. API fetches without that category
3. Those markers disappear

---

## ✨ Pro Tips

1. **To see non-wildfire events clearly:** Deselect "Wildfires" first
2. **To limit results:** Enable "Viewport Only" and zoom into specific areas
3. **To see historical events:** Adjust the date range in filters
4. **To debug:** Check console for `[EONET]` log messages
5. **For performance:** Keep "Viewport Only" enabled when zoomed out

---

## 🎉 Success Criteria

The implementation is successful if:

✅ You can filter out wildfires to see other event types  
✅ Each event category has a unique pin color  
✅ Viewport-only mode limits results to visible area  
✅ Panning/zooming triggers debounced refetches  
✅ Date range controls work correctly  
✅ Counter shows accurate event count  
✅ Console logs show API requests  
✅ No app crashes or unhandled errors  

---

## 📞 Questions?

If something doesn't work as expected:
1. Check the console for error messages
2. Verify the EventContext is wrapped around your app (it is - in `app/_layout.tsx`)
3. Make sure imports are correct
4. Try clearing filters and resetting to defaults

Happy testing! 🚀

