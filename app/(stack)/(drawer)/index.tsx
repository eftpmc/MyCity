// app/(drawer)/index.tsx
import { useCities } from '@/contexts/CitiesContext';
import rawCities from '@/data/us_cities.json';
import { City } from '@/types';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from "expo-router";
import { LogIn, Menu, Search, X, ZoomIn } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet as RNStyleSheet,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const usCities = rawCities as City[];

// helper: radians
const toRad = (value: number) => (value * Math.PI) / 180;

// helper: haversine distance in km
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { cities } = useCities();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [nearestCity, setNearestCity] = useState<City | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(15);

  const mapRef = useRef<MapView>(null);

  const searchCities = (text: string) => {
    setQuery(text);
    if (text.length < 2) return setResults([]);
    setResults(
      usCities
        .filter((c) => c.city.toLowerCase().startsWith(text.toLowerCase()))
        .slice(0, 20)
    );
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
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

  const zoomInSelected = () => {
    if (selectedCity) animateTo(selectedCity, 0.2, 600);
  };

  const updateNearestCity = (lat: number, lng: number) => {
    let bestCity: City | null = null;
    let bestScore = Infinity;

    for (const city of usCities) {
      const dist = getDistance(lat, lng, parseFloat(city.lat), parseFloat(city.lng));
      const pop = city.population ?? 0;

      // Score: distance divided by log(population+1)
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
      </MapView>

      {/* Top controls (hamburger + search) */}
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
      </View>

      {/* Search results */}
      {query.length > 0 && (
        <FlatList
          style={styles.resultsList}
          contentContainerStyle={styles.resultsContainer}
          data={results}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => flyToCity(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.resultTitle}>{item.city}</Text>
              <Text style={styles.resultSubtitle}>
                {item.state_name} ({item.state_id})
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Quick nearest city card when not searching */}
      {query.length === 0 && !selectedCity && nearestCity && zoomLevel < 2 && (
        <View style={styles.quickResultWrap}>
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => flyToCity(nearestCity)}
            activeOpacity={0.7}
          >
            <Text style={styles.resultTitle}>{nearestCity.city}</Text>
            <Text style={styles.resultSubtitle}>
              {nearestCity.state_name} ({nearestCity.state_id})
            </Text>
            {nearestCity.population && (
              <Text style={styles.resultSubtitle}>
                Pop. {nearestCity.population.toLocaleString()}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom-center city menu */}
      {selectedCity && (
        <View pointerEvents="box-none" style={styles.bottomWrap}>
          <View style={styles.bottomMenu}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.bottomTitle}>{selectedCity.city}</Text>
              <Text style={styles.bottomSubtitle}>
                {selectedCity.state_name} ({selectedCity.state_id})
              </Text>
            </View>

            <TouchableOpacity style={styles.iconBtn} onPress={() => setSelectedCity(null)}>
              <X size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} onPress={zoomInSelected}>
              <ZoomIn size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() =>
                router.push({ pathname: '/city/[city]', params: { ...selectedCity } })
              }
            >
              <LogIn size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  topControls: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },

  hamburger: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1c1c1e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 48,
  },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, color: '#fff', fontSize: 16 },
  clearButton: { padding: 4 },

  resultsList: {
    position: 'absolute',
    top: 110,
    left: 20,
    right: 20,
    maxHeight: 280,
    zIndex: 2,
  },

  resultsContainer: {
    paddingBottom: 12,
  },

  resultItem: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  resultTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  resultSubtitle: {
    color: '#9a9a9a',
    fontSize: 13,
    marginTop: 2,
  },

  quickResultWrap: {
    position: 'absolute',
    top: 110,
    left: 20,
    right: 20,
    zIndex: 2,
  },

  // Bottom center menu
  bottomWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 48,
    alignItems: 'center',
    zIndex: 3,
  },
  bottomMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    minWidth: 260,
    maxWidth: 340,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  bottomTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  bottomSubtitle: { color: '#9a9a9a', fontSize: 12, marginTop: 2 },

  iconBtn: {
    width: 36,
    height: 36,
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: '#2c2c2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
});