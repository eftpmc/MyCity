import { useCities } from '@/contexts/CitiesContext';
import { useMapLayer } from '@/contexts/MapLayerContext';
import rawCities from '@/data/us_cities.json';
import { City } from '@/types';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';

import CityMenu from '@/components/CityMenu';
import LayerDropdown from '@/components/LayerDropdown';
import MapDisplay from '@/components/MapDisplay';
import TopControls from '@/components/TopControls';

const usCities = rawCities as City[];

const toRad = (value: number) => (value * Math.PI) / 180;
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { cities } = useCities();
  const { activeLayer, setLayer, availableLayers } = useMapLayer();
  const mapRef = useRef<MapView | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [nearestCity, setNearestCity] = useState<City | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(15);
  const [events, setEvents] = useState<any[]>([]);
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
    setQuery('');
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

  const fetchEvents = async () => {
    const res = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100');
    const data = await res.json();
    setEvents(data.events || []);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={RNStyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 15,
          longitudeDelta: 15,
        }}
        onRegionChangeComplete={(region) => {
          setZoomLevel(region.latitudeDelta);
          if (region.latitudeDelta < 2) {
            updateNearestCity(region.latitude, region.longitude);
          } else {
            setNearestCity(null);
          }
        }}
        onPress={() => setSelectedCity(null)}
      >
        <>
          {/* Natural Events */}
          {events.map((ev, i) => {
            // each event can have multiple geometries, find the first valid coordinate
            const geom = Array.isArray(ev.geometry) ? ev.geometry.find((g) => g.coordinates?.length >= 2) : null;
            if (!geom) return null;

            const [lon, lat] = geom.coordinates;
            return (
              <Marker
                key={`event-${i}`}
                coordinate={{ latitude: lat, longitude: lon }}
                title={ev.title}
                description={ev.categories?.map((c: any) => c.title).join(', ')}
                pinColor="#ff7043" // orange tone
              />
            );
          })}
          {cities.map((city, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: parseFloat(city.lat),
                longitude: parseFloat(city.lng),
              }}
              title={city.city}
              description={city.state_name}
              onPress={() => flyToCity(city)}
            />
          ))}
          {activeLayer && (
            <UrlTile
              urlTemplate={activeLayer.url}
              maximumZ={activeLayer.maxZoom ?? 9}
              zIndex={-1}
              tileSize={256}
            />
          )}
        </>
      </MapView>

      {/* Top controls (hamburger + search + dropdown) */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.hamburger}
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        >
          <Menu size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.searchWrapper}>
          <Search size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a city"
            placeholderTextColor="#888"
            value={query}
            onChangeText={searchCities}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {/* Dropdown Button */}
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(true)}
        >
          <Text style={styles.dropdownText}>
            {activeLayer?.name || 'No Layer'}
          </Text>
          <ChevronDown size={18} color="#fff" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>

      {/* Dropdown Modal */}
      <Modal
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
  container: { flex: 1, backgroundColor: '#000' },
});