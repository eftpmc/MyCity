import { useCities } from '@/contexts/CitiesContext';
import rawCities from '@/data/us_cities.json';
import { useLocalSearchParams } from 'expo-router';
import { Minus, Plus } from 'lucide-react-native';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type City = {
  city: string;
  state_id: string;
  state_name: string;
  lat: string;
  lng: string;
};

const usCities = rawCities as City[];

export default function CityDetailsPage() {
  const { city: cityName, state_id } = useLocalSearchParams<{
    city: string;
    state_id: string;
  }>();

  const { addCity, removeCity, isAdded } = useCities();

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
      {/* Header Info with Add/Remove button */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{city.city}</Text>
          <Text style={styles.subtitle}>
            {city.state_name} ({city.state_id})
          </Text>
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => (added ? removeCity(city) : addCity(city))}
        >
          {added ? (
            <Minus size={32} color="#fff" />
          ) : (
            <Plus size={32} color="#fff" />
          )}
        </TouchableOpacity>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 18, color: '#aaa' },
  iconButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 },
  coords: { flexDirection: 'row', gap: 20 },
  coordText: { fontSize: 14, color: '#777' },
  placeholder: { fontSize: 14, color: '#555' },
});