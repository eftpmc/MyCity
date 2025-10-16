import { City } from '@/types';
import { DrawerActions } from '@react-navigation/native';
import { ChevronDown, Filter, Menu, Search, X } from 'lucide-react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
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
  onFilterPress?: () => void;
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
  onFilterPress,
}: Props) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 600; // stack for narrow screens

  return (
    <>
      <View style={[styles.topControls, isCompact && { flexDirection: 'column' }]}>
        {/* MAIN ROW (menu + search + buttons on large screens) */}
        <View
          style={[
            styles.mainRow,
            isCompact && { flexDirection: 'column', alignItems: 'stretch' },
          ]}
        >
          {/* 🍔 Drawer */}
          <TouchableOpacity
            style={styles.hamburger}
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          >
            <Menu size={22} color="#fff" />
          </TouchableOpacity>

          {/* 🔍 Search */}
          <View style={[styles.searchWrapper, isCompact && { flex: 1, marginRight: 0 }]}>
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

          {/* Only show buttons inline on large screens */}
          {!isCompact && results.length === 0 && (
            <>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setDropdownVisible(true)}
              >
                <Text style={styles.dropdownText}>
                  {activeLayer?.name || 'No Layer'}
                </Text>
                <ChevronDown size={18} color="#fff" style={{ marginLeft: 4 }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={onFilterPress}
                activeOpacity={0.8}
              >
                <Filter size={20} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* On small screens → buttons go to a new row */}
        {isCompact && results.length === 0 && (
          <View style={styles.secondRow}>
            <TouchableOpacity
              style={[styles.dropdownButton, { flex: 1, marginLeft: 0 }]}
              onPress={() => setDropdownVisible(true)}
            >
              <Text style={styles.dropdownText}>
                {activeLayer?.name || 'No Layer'}
              </Text>
              <ChevronDown size={18} color="#fff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, { marginLeft: 8 }]}
              onPress={onFilterPress}
              activeOpacity={0.8}
            >
              <Filter size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 📜 Search Results */}
      {query.length > 0 && (
        <FlatList
          style={styles.resultsList}
          contentContainerStyle={styles.resultsContainer}
          data={results}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultItem}
              onPress={() => {
                flyToCity(item);
                // Also navigate to city details page
                router.push({ 
                  pathname: '/city/[city]', 
                  params: { ...item } 
                });
              }}
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
    zIndex: 4,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
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

  iconButton: {
    width: 48,
    height: 48,
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: '#1c1c1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsList: {
    position: 'absolute',
    top: 136, // comfortably below the search bar
    left: 20,
    right: 20,
    maxHeight: 320,
    zIndex: 3,
    paddingTop: 10, // visual gap between input and first result
  },
  resultsContainer: { paddingTop: 0, paddingBottom: 12 },
  resultItem: {
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2d',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  resultTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resultSubtitle: { color: '#9a9a9a', fontSize: 13, marginTop: 2 },
});