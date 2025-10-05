import { useCities } from "@/contexts/CitiesContext";
import { useEvents } from "@/contexts/EventContext";
import { useMapLayer } from "@/contexts/MapLayerContext";
import rawCities from "@/data/us_cities.json";
import { City } from "@/types";
import { useNavigation, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView from "react-native-maps";

import CityMenu from "@/components/CityMenu";
import LayerDropdown from "@/components/LayerDropdown";
import MapDisplay from "@/components/MapDisplay";
import TopControls from "@/components/TopControls";

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

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { cities } = useCities();
  const { activeLayer, setLayer, availableLayers } = useMapLayer();
  const { events } = useEvents(); // ⬅️ from context
  const mapRef = useRef<MapView | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [nearestCity, setNearestCity] = useState<City | null>(null);
  const [zoomLevel, setZoomLevel] = useState(15);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const searchCities = (text: string) => {
    setQuery(text);
    if (text.length < 2) return setResults([]);
    setResults(
      usCities
        .filter((c) => c.city.toLowerCase().startsWith(text.toLowerCase()))
        .slice(0, 20)
    );
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

  return (
    <View style={styles.container}>
      <MapDisplay
        mapRef={mapRef}
        cities={cities}
        events={events}
        activeLayer={activeLayer}
        onFlyToCity={flyToCity}
        onRegionChange={updateNearestCity}
        onDeselectCity={() => setSelectedCity(null)}
        setZoomLevel={setZoomLevel}
      />

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

      <LayerDropdown
        visible={dropdownVisible}
        setVisible={setDropdownVisible}
        availableLayers={availableLayers}
        activeLayer={activeLayer}
        setLayer={setLayer}
      />

      <CityMenu
        selectedCity={selectedCity}
        nearestCity={nearestCity}
        zoomLevel={zoomLevel}
        flyToCity={flyToCity}
        setSelectedCity={setSelectedCity}
        router={router}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
});