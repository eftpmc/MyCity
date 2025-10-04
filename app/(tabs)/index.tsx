import { useRouter } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import CityCard from '@/components/CityCard';
import { useCities } from '@/contexts/CitiesContext'; // 👈 use context
import rawCities from '@/data/us_cities.json';

type City = {
  city: string;
  state_id: string;
  state_name: string;
  lat: string;
  lng: string;
};

const usCities = rawCities as City[];

export default function HomeScreen() {
  const router = useRouter();
  const { cities } = useCities(); // 👈 full City objects
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);

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
      <Text style={styles.header}>MyCity</Text>

      {/* Search Bar with icon + clear button */}
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

      {query.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item, idx) => idx.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() =>
                router.push({
                  pathname: '/city/[city]',
                  params: { ...item }, // ✅ full city object
                })
              }
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
                onPress={() =>
                  router.push({
                    pathname: '/city/[city]',
                    params: { city: city.city, state_id: city.state_id },
                  })
                }
              >
                <CityCard city={city.city} state={city.state_name} />
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 60 },
  header: {
    fontSize: 34,
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
  clearButton: {
    padding: 4,
  },

  content: { paddingHorizontal: 16, marginTop: 20 },
  resultItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  resultText: { color: '#fff', fontSize: 16 },
});