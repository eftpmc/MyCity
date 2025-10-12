import { useCities } from "@/contexts/CitiesContext";
import { useEvents } from "@/contexts/EventContext";
import { useMapLayer } from "@/contexts/MapLayerContext";
import rawCities from "@/data/us_cities.json";
import { City } from "@/types";
import { useNavigation, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Platform } from "react-native";

import CityMenu from "@/components/CityMenu";
import LayerDropdown from "@/components/LayerDropdown";
import LayerLegend from "@/components/LayerLegend";
import LayerTimeline from "@/components/LayerTimeline";
import TopControls from "@/components/TopControls";
import { CATEGORY_MAP } from "@/contexts/EventContext";

const usCities = rawCities as City[];

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { cities } = useCities();
  const { activeLayer, setLayer, availableLayers } = useMapLayer();
  const { events, filters, setFilters, setRegion, refreshEvents } = useEvents();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchCities = (text: string) => {
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

  const flyToCity = (city: City) => {
    setSelectedCity(city);
    setQuery("");
    setResults([]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌍 Urba</Text>
        <Text style={styles.subtitle}>Urban Environmental Intelligence</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search cities..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={searchCities}
        />
        
        {results.length > 0 && (
          <ScrollView style={styles.resultsContainer}>
            {results.map((city, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resultItem}
                onPress={() => flyToCity(city)}
              >
                <Text style={styles.resultText}>
                  {city.city}, {city.state_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Selected City Info */}
      {selectedCity && (
        <View style={styles.cityInfo}>
          <Text style={styles.cityName}>{selectedCity.city}</Text>
          <Text style={styles.cityState}>{selectedCity.state_name}</Text>
          <Text style={styles.cityCoords}>
            {selectedCity.lat}, {selectedCity.lng}
          </Text>
          {selectedCity.population && (
            <Text style={styles.cityPopulation}>
              Population: {selectedCity.population.toLocaleString()}
            </Text>
          )}
          
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => router.push(`/city/${selectedCity.city}/${selectedCity.state_id}`)}
          >
            <Text style={styles.viewDetailsText}>View Details & Reports</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Environmental Data Preview */}
      <View style={styles.dataPreview}>
        <Text style={styles.sectionTitle}>Environmental Data Available</Text>
        <View style={styles.dataGrid}>
          <View style={styles.dataItem}>
            <Text style={styles.dataIcon}>🌡️</Text>
            <Text style={styles.dataLabel}>Temperature</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataIcon}>🌫️</Text>
            <Text style={styles.dataLabel}>Air Quality</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataIcon}>💧</Text>
            <Text style={styles.dataLabel}>Humidity</Text>
          </View>
          <View style={styles.dataItem}>
            <Text style={styles.dataIcon}>🔥</Text>
            <Text style={styles.dataLabel}>Disasters</Text>
          </View>
        </View>
      </View>

      {/* Events Info */}
      <View style={styles.eventsInfo}>
        <Text style={styles.sectionTitle}>Natural Disasters Tracked</Text>
        <Text style={styles.eventsCount}>
          {events.length} events currently monitored
        </Text>
        <Text style={styles.eventsNote}>
          Real-time data from NASA EONET
        </Text>
      </View>

      {/* Web Notice */}
      <View style={styles.webNotice}>
        <Text style={styles.webNoticeText}>
          🌐 Web Version - Full interactive features available in mobile app
        </Text>
        <Text style={styles.webNoticeSubtext}>
          Download the mobile app for complete map functionality and real-time data
        </Text>
      </View>

      {/* Layer Controls */}
      <LayerDropdown
        visible={dropdownVisible}
        setVisible={setDropdownVisible}
        availableLayers={availableLayers}
        activeLayer={activeLayer}
        setLayer={setLayer}
      />

      <LayerTimeline />
      <LayerLegend />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000",
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  resultsContainer: {
    maxHeight: 200,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  resultText: {
    color: '#fff',
    fontSize: 14,
  },
  cityInfo: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cityState: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 8,
  },
  cityCoords: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
  },
  cityPopulation: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 16,
  },
  viewDetailsButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dataPreview: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dataItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  dataIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  dataLabel: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  eventsInfo: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  eventsCount: {
    fontSize: 16,
    color: '#4A90E2',
    marginBottom: 8,
  },
  eventsNote: {
    fontSize: 14,
    color: '#777',
  },
  webNotice: {
    backgroundColor: '#1a3a5c',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  webNoticeText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  webNoticeSubtext: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
  },
});
