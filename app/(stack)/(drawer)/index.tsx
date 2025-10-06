import { useCities } from "@/contexts/CitiesContext";
import { useEvents } from "@/contexts/EventContext";
import { useMapLayer } from "@/contexts/MapLayerContext";
import rawCities from "@/data/us_cities.json";
import { City } from "@/types";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useNavigation, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MapView, { Region } from "react-native-maps";

import CityMenu from "@/components/CityMenu";
import LayerDropdown from "@/components/LayerDropdown";
import LayerLegend from "@/components/LayerLegend";
import LayerTimeline from "@/components/LayerTimeline";
import MapDisplay from "@/components/MapDisplay";
import TopControls from "@/components/TopControls";
import { CATEGORY_MAP } from "@/contexts/EventContext";

const usCities = rawCities as City[];

const toRad = (v: number) => (v * Math.PI) / 180;
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Helpers
const toISODate = (d: Date) => d.toISOString().split("T")[0];
const addMonths = (date: Date, months: number) => {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) d.setDate(0);
  return d;
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { cities } = useCities();
  const { activeLayer, setLayer, availableLayers } = useMapLayer();
  const { events, filters, setFilters, setRegion, refreshEvents } = useEvents();

  const mapRef = useRef<MapView | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [nearestCity, setNearestCity] = useState<City | null>(null);
  const [zoomLevel, setZoomLevel] = useState(15);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeQuick, setActiveQuick] = useState<"1M" | "3M" | "6M" | "1Y" | null>(null);

  const snapPoints = useMemo(() => ["40%", "75%"], []);

  const searchCities = (text: string) => {
    // Hide layers dropdown while searching to avoid visual overlap
    if (dropdownVisible) setDropdownVisible(false);

    setQuery(text);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      if (text.trim().length < 2) {
        setResults([]);
        return;
      }
      const q = text.toLowerCase();
      setResults(
        usCities
          .filter((c) => c.city.toLowerCase().includes(q))
          .slice(0, 20)
      );
    }, 120);
  };

  const animateTo = (city: City, delta = 0.7, duration = 2000) => {
    const lat = parseFloat(city.lat);
    const lng = parseFloat(city.lng);
    mapRef.current?.animateToRegion(
      { latitude: lat, longitude: lng, latitudeDelta: delta, longitudeDelta: delta },
      duration
    );
  };

  const flyToCity = (city: City) => {
    animateTo(city, 0.7, 2000);
    setSelectedCity(city);
    setQuery("");
    setResults([]);
  };

  const updateNearestCity = (lat: number, lng: number) => {
    let bestCity: City | null = null;
    let bestScore = Infinity;
    for (const city of usCities) {
      const dist = getDistance(lat, lng, parseFloat(city.lat), parseFloat(city.lng));
      const pop = city.population ?? 0;
      const score = dist / (Math.log(pop + 1) || 1);
      if (score < bestScore) {
        bestScore = score;
        bestCity = city;
      }
    }
    setNearestCity(bestCity);
  };

  const openFilterSheet = () => bottomSheetRef.current?.expand();
  const closeFilterSheet = () => bottomSheetRef.current?.close();

  const handleCategoryToggle = (cat: string) => {
    const newCats = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    setFilters({ ...filters, categories: newCats });
  };

  const deselectAllCategories = () => {
    setFilters({ ...filters, categories: [] });
  };

  const selectAllCategories = () => {
    setFilters({ ...filters, categories: Object.values(CATEGORY_MAP) });
  };

  // 🔹 Quick ranges: add months to Start Date → set End Date (toggleable)
  const applyQuickRange = (key: "1M" | "3M" | "6M" | "1Y") => {
    // If the same button is clicked again, deselect it
    if (activeQuick === key) {
      setActiveQuick(null);
      setFilters({ ...filters, end: "" });
      return;
    }

    const startBase = filters.start && !isNaN(Date.parse(filters.start))
      ? new Date(filters.start)
      : new Date();

    const months = key === "1Y" ? 12 : parseInt(key.replace("M", ""), 10);
    const endDate = addMonths(startBase, months);
    const end = toISODate(endDate);

    setActiveQuick(key);
    setFilters({ ...filters, end });
  };

  return (
    <View style={styles.container}>
      {/* 🌍 Map */}
      <MapDisplay
        mapRef={mapRef}
        cities={cities}
        events={events}
        activeLayer={activeLayer}
        onFlyToCity={flyToCity}
        onRegionChange={updateNearestCity}
        onDeselectCity={() => setSelectedCity(null)}
        setZoomLevel={setZoomLevel}
        onRegionChangeComplete={(region: Region) => setRegion(region)}
      />

      {/* 🔎 Top Controls */}
      <TopControls
        navigation={navigation}
        query={query}
        searchCities={searchCities}
        clearSearch={() => {
          setQuery("");
          setResults([]);
        }}
        activeLayer={activeLayer}
        setDropdownVisible={(v: boolean) => {
          // Opening layers should clear search results to prevent overlap
          if (v) {
            setQuery("");
            setResults([]);
          }
          setDropdownVisible(v);
        }}
        results={results}
        flyToCity={flyToCity}
        onFilterPress={openFilterSheet}
      />

      {/* 🗺 Layer Dropdown - ONLY show if search results are empty */}
      {results.length === 0 && (
        <LayerDropdown
          visible={dropdownVisible}
          setVisible={setDropdownVisible}
          availableLayers={availableLayers}
          activeLayer={activeLayer}
          setLayer={setLayer}
        />
      )}

      {/* 🎛 Bottom Sheet Filters */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Disaster Event Filters</Text>

          {/* 📅 Quick Ranges */}
          <Text style={styles.label}>Time Range (tap to toggle)</Text>
          <View style={styles.quickRow}>
            {(["1M", "3M", "6M", "1Y"] as const).map((k) => (
              <TouchableOpacity
                key={k}
                onPress={() => applyQuickRange(k)}
                style={[styles.quickBtn, activeQuick === k && styles.quickBtnActive]}
              >
                <Text style={[styles.quickText, activeQuick === k && styles.quickTextActive]}>
                  {k}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 📅 Date Range */}
          <Text style={styles.label}>Start Date</Text>
          <TextInput
            style={styles.input}
            value={filters.start}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#888"
            onChangeText={(v) => {
              setActiveQuick(null);
              setFilters({ ...filters, start: v });
            }}
          />

          <Text style={styles.label}>End Date</Text>
          <TextInput
            style={styles.input}
            value={filters.end}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#888"
            onChangeText={(v) => {
              setActiveQuick(null);
              setFilters({ ...filters, end: v });
            }}
          />

          {/* 🔖 Categories */}
          <View style={styles.categoriesHeaderRow}>
            <Text style={[styles.label, { marginTop: 10 }]}>Event Categories</Text>
            <View style={styles.categoryButtonsRow}>
              <TouchableOpacity
                onPress={selectAllCategories}
                style={styles.smallOutlineBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.smallOutlineBtnText}>Select All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={deselectAllCategories}
                style={styles.smallOutlineBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.smallOutlineBtnText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
          {filters.categories.length === 0 && (
            <Text style={styles.helpText}>
              💡 Select event categories below to see natural disasters and weather events on the map
            </Text>
          )}
          <View style={styles.categoriesWrap}>
            {Object.keys(CATEGORY_MAP).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  filters.categories.includes(CATEGORY_MAP[cat]) && styles.categoryActive,
                ]}
                onPress={() => handleCategoryToggle(CATEGORY_MAP[cat])}
              >
                <Text
                  style={[
                    styles.categoryText,
                    filters.categories.includes(CATEGORY_MAP[cat]) && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ✅ Apply */}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => {
              refreshEvents();
              closeFilterSheet();
            }}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>

      {/* 🏙 City Menu */}
      <CityMenu
        selectedCity={selectedCity}
        nearestCity={nearestCity}
        zoomLevel={zoomLevel}
        flyToCity={flyToCity}
        setSelectedCity={setSelectedCity}
        router={router}
      />

      {/* ⏳ Timeline */}
      <LayerTimeline />
      <LayerLegend />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  sheetBackground: {
    backgroundColor: "rgba(15,15,15,0.95)",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  sheetHandle: { backgroundColor: "#555", width: 40 },
  sheetContent: { flex: 1, padding: 18 },
  sheetTitle: { fontSize: 18, fontWeight: "600", color: "#fff", marginBottom: 12 },

  // Quick ranges
  quickRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  quickBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "#333",
  },
  quickBtnActive: {
    backgroundColor: "#4A90E2",
    borderColor: "#4A90E2",
  },
  quickText: { color: "#ddd", fontSize: 13, fontWeight: "600" },
  quickTextActive: { color: "#fff" },

  label: { color: "#ccc", fontSize: 14, marginBottom: 4 },
  input: {
    backgroundColor: "#1a1a1a",
    color: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
  },

  categoriesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 8,
  },
  categoriesHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  helpText: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
    marginBottom: 12,
    textAlign: "center",
  },
  smallOutlineBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    backgroundColor: "#1a1a1a",
  },
  smallOutlineBtnText: { color: "#ddd", fontSize: 12, fontWeight: "600" },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#222",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  categoryActive: { backgroundColor: "#4A90E2", borderColor: "#4A90E2" },
  categoryText: { color: "#fff", fontSize: 13 },
  categoryTextActive: { color: "#fff" },

  applyButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  applyButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});