import { useRouter } from 'expo-router';
import { Menu, Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import CityCard from '@/components/CityCard';
import { useCities } from '@/contexts/CitiesContext';
import rawCities from '@/data/us_cities.json';

type City = {
  city: string;
  state_id: string;
  state_name: string;
  lat: string;
  lng: string;
};

const usCities = rawCities as City[];
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function HomeScreen() {
  const router = useRouter();
  const { cities } = useCities();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const searchCities = (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }
    const filtered = usCities
      .filter((c) => c.city.toLowerCase().startsWith(text.toLowerCase()))
      .slice(0, 20);
    setResults(filtered);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <View style={styles.container}>
      {/* Map Area */}
      <View style={styles.mapArea}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: 37.7749,
            longitude: -122.4194,
            latitudeDelta: 15,
            longitudeDelta: 15,
          }}
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
            />
          ))}
        </MapView>

        {/* Hamburger Button */}
        <TouchableOpacity
          style={styles.hamburger}
          onPress={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <View style={styles.sidebar}>
          <Text style={styles.header}>MyCity</Text>

          {/* Search */}
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

          {/* Results or Saved Cities */}
          {query.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => {
                    setSidebarOpen(false); // close drawer
                    router.push({
                      pathname: '/city/[city]',
                      params: { ...item },
                    });
                  }}
                >
                  <Text style={styles.resultText}>
                    {item.city}, {item.state_name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.content}>
              {cities.length === 0 ? (
                <Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>
                  No cities added yet
                </Text>
              ) : (
                cities.map((city, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSidebarOpen(false); // close drawer
                      router.push({
                        pathname: '/city/[city]',
                        params: { ...city },
                      });
                    }}
                  >
                    <CityCard city={city.city} state={city.state_name} />
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  mapArea: { flex: 1 },

  hamburger: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
    padding: 6,
  },

  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.7,
    backgroundColor: '#111',
    paddingTop: 60,
    borderRightColor: '#333',
    borderRightWidth: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    color: '#fff',
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: { padding: 4 },

  content: { paddingHorizontal: 16, marginTop: 20 },
  resultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  resultText: { color: '#fff', fontSize: 16 },
});