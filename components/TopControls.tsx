import { City } from '@/types';
import { DrawerActions } from '@react-navigation/native';
import { ChevronDown, Menu, Search, X } from 'lucide-react-native';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Props {
  navigation: any;
  query: string;
  searchCities: (t: string) => void;
  clearSearch: () => void;
  activeLayer: any;
  setDropdownVisible: (v: boolean) => void;
  results: City[];
  flyToCity: (c: City) => void;
}

export default function TopControls({
  navigation,
  query,
  searchCities,
  clearSearch,
  activeLayer,
  setDropdownVisible,
  results,
  flyToCity,
}: Props) {
  return (
    <>
      {/* Top Bar */}
      <View style={styles.topControls}>
        {/* Hamburger */}
        <TouchableOpacity
          style={styles.hamburger}
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        >
          <Menu size={22} color="#fff" />
        </TouchableOpacity>

        {/* Search Bar */}
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

        {/* Dropdown Trigger */}
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

      {/* Search Results */}
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
    </>
  );
}

const styles = StyleSheet.create({
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

  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginLeft: 10,
  },
  dropdownText: { color: '#fff', fontSize: 14 },

  resultsList: {
    position: 'absolute',
    top: 110,
    left: 20,
    right: 20,
    maxHeight: 280,
    zIndex: 2,
  },
  resultsContainer: { paddingBottom: 12 },
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
  resultTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resultSubtitle: { color: '#9a9a9a', fontSize: 13, marginTop: 2 },
});