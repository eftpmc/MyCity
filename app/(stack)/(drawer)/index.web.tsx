import { useCities } from "@/contexts/CitiesContext";
import { useEvents } from "@/contexts/EventContext";
import { useMapLayer } from "@/contexts/MapLayerContext";
import rawCities from "@/data/us_cities.json";
import { City } from "@/types";
import { useNavigation, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from "react-native";

import CityMenu from "@/components/CityMenu";
import LayerDropdown from "@/components/LayerDropdown";
import LayerLegend from "@/components/LayerLegend";
import LayerTimeline from "@/components/LayerTimeline";
import MapDisplay from "@/components/MapDisplay.web"; // Web-compatible version
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

  const mapRef = useRef<any>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [nearestCity, setNearestCity] = useState<City | null>(null);
  const [zoomLevel, setZoomLevel] = useState(15);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeQuick, setActiveQuick] = useState<"1M" | "3M" | "6M" | "1Y" | null>(null);

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
    
    if (mapRef.current && mapRef.current.panTo) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(10);
    }
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

  // Quick ranges: add months to Start Date → set End Date (toggleable)
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
        onRegionChangeComplete={(region: any) => setRegion(region)}
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
        onFilterPress={() => {
          // For web, we'll show a simple alert instead of bottom sheet
          alert('Filter functionality available in mobile app');
        }}
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

      {/* Web-specific info */}
      <View style={styles.webInfo}>
        <Text style={styles.webInfoText}>
          🌐 Web Version - Full features available in mobile app
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  webInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  webInfoText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
