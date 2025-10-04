import { useCities } from '@/contexts/CitiesContext';
import { useLocalSearchParams } from 'expo-router';
import { Minus, Plus } from 'lucide-react-native';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ✅ use this one

export default function CityDetailsPage() {
  const params = useLocalSearchParams<{
    city: string;
    state_id: string;
    state_name: string;
    lat: string;
    lng: string;
  }>();

  const { addCity, removeCity, isAdded } = useCities();

  // Normalize params into a City object
  const city = {
    city: params.city || '',
    state_id: params.state_id || '',
    state_name: params.state_name || '',
    lat: params.lat || '',
    lng: params.lng || '',
  };

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
          style={[styles.button, added ? styles.removeButton : styles.addButton]}
          onPress={() => (added ? removeCity(city) : addCity(city))}
        >
          {added ? (
            <Minus size={20} color="#fff" />
          ) : (
            <Plus size={20} color="#fff" />
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

      {/* Placeholder for future details */}
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

  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButton: { backgroundColor: '#4aa3ff' },
  removeButton: { backgroundColor: '#ff4a4a' },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 },

  coords: { flexDirection: 'row', gap: 20 },
  coordText: { fontSize: 14, color: '#777' },

  placeholder: { fontSize: 14, color: '#555' },
});