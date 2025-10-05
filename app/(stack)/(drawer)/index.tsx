import { useCities } from "@/contexts/CitiesContext";
import { useEvents } from "@/contexts/EventContext";
import { useMapLayer } from "@/contexts/MapLayerContext";
import rawCities from "@/data/us_cities.json";
import { City } from "@/types";
import { useNavigation, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Text, Modal, Platform } from "react-native";
import MapView, { Region } from "react-native-maps";

import CityMenu from "@/components/CityMenu";
import LayerDropdown from "@/components/LayerDropdown";
import LayerTimeline from "@/components/LayerTimeline"; // ⬅️ new import
import MapDisplay from "@/components/MapDisplay";
import TopControls from "@/components/TopControls";
import { EventsFilter } from "@/contexts/EventFunctionality/EventsFilter";

const usCities = rawCities as City[];

// helper functions for distance calc
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

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { cities } = useCities();
  const { activeLayer, setLayer, availableLayers } = useMapLayer();
  const { events, filters, setFilters, setRegion } = useEvents();
  const mapRef = useRef<MapView | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [nearestCity, setNearestCity] = useState<City | null>(null);
  const [zoomLevel, setZoomLevel] = useState(15);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Search logic
  const searchCities = (text: string) => {
    setQuery(text);
    if (text.length < 2) return setResults([]);
    setResults(
      usCities
        .filter((c) => c.city.toLowerCase().startsWith(text.toLowerCase()))
        .slice(0, 20)
    );
  };

  // Map navigation
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

  // Determine nearest city
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

  return (
    <View style={styles.container}>
      {/* 🌍 Main Map Display */}
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

      {/* 🔎 Top Bar Controls */}
      <TopControls
        navigation={navigation}
        query={query}
        searchCities={searchCities}
        clearSearch={() => {
          setQuery("");
          setResults([]);
        }}
        activeLayer={activeLayer}
        setDropdownVisible={setDropdownVisible}
        results={results}
        flyToCity={flyToCity}
      />

      {/* 🗺️ Layer Dropdown */}
      <LayerDropdown
        visible={dropdownVisible}
        setVisible={setDropdownVisible}
        availableLayers={availableLayers}
        activeLayer={activeLayer}
        setLayer={setLayer}
      />

      {/* 🏙️ City Info / Quick Nearest City */}
      <CityMenu
        selectedCity={selectedCity}
        nearestCity={nearestCity}
        zoomLevel={zoomLevel}
        flyToCity={flyToCity}
        setSelectedCity={setSelectedCity}
        router={router}
      />

      {/* Event Counter */}
      <View style={styles.counterPill}>
        <Text style={styles.counterText}>Events: {events.length}</Text>
      </View>

      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.filterButtonText}>🔍 Filters</Text>
      </TouchableOpacity>

      {/* Filter Modal */}
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

      {/* ⏳ Layer Timeline (Bottom Slider) */}
      <LayerTimeline />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  counterPill: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  counterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
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
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
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