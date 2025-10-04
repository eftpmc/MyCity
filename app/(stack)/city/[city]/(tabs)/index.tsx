import { useCities } from '@/contexts/CitiesContext';
import rawCities from '@/data/us_cities.json';
import { City } from '@/types';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Map, Menu, Minus, Plus } from 'lucide-react-native';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const usCities: City[] = (rawCities as any[]).map((c:any)=> ({
  city: c.city,
  state_id: c.state_id,
  state_name: c.state_name,
  lat: c.lat,
  lng: c.lng,
  population: typeof c.population === 'number' ? c.population : (c.population ? Number(c.population) : undefined),
}));

export default function CityDetailsPage() {
  const { city: cityName, state_id } = useLocalSearchParams<{
    city: string;
    state_id: string;
  }>();

  const { addCity, removeCity, isAdded } = useCities();
  const navigation = useNavigation();
  const router = useRouter();

  // Lookup the city object from dataset
  const city = usCities.find(
    (c) => c.city === cityName && c.state_id === state_id
  );

  if (!city) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#fff', padding: 20 }}>
          City not found
        </Text>
      </SafeAreaView>
    );
  }

  const added = isAdded(city);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top controls: hamburger + map + add/remove button */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.squareButton}
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        >
          <Menu size={22} color="#fff" />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={styles.squareButton}
          onPress={() => router.replace('/')}
        >
          <Map size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.squareButton}
          onPress={() => (added ? removeCity(city) : addCity(city))}
        >
          {added ? (
            <Minus size={22} color="#fff" />
          ) : (
            <Plus size={22} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Header Info */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{city.city}</Text>
          <Text style={styles.subtitle}>
            {city.state_name} ({city.state_id})
          </Text>
        </View>
      </View>

      {/* Coordinates Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coordinates</Text>
        <View style={styles.coords}>
          <Text style={styles.coordText}>Lat: {city.lat}</Text>
          <Text style={styles.coordText}>Lng: {city.lng}</Text>
        </View>
      </View>

      {/* Placeholder Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weather</Text>
        <Text style={styles.placeholder}>Coming soon...</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Population</Text>
        <Text style={styles.placeholder}>Coming soon...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },

  squareButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1c1c1e',
    alignItems: 'center',
    justifyContent: 'center',
  },

  header: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },

  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 18, color: '#aaa' },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 },
  coords: { flexDirection: 'row', gap: 20 },
  coordText: { fontSize: 14, color: '#777' },
  placeholder: { fontSize: 14, color: '#555' },
});