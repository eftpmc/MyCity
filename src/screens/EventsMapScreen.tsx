/**
 * Events Map Screen
 * Main screen rendering map with event markers and filter UI
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_DEFAULT } from 'react-native-maps';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { EventsFilter } from '../features/events/EventsFilter';
import { EventDetailsSheet } from '../components/EventDetailsSheet';
import { TimelineBar } from '../components/TimelineBar';
import { useEvents } from '../features/events/useEvents';
import {
  FilterState,
  createDefaultFilters,
  regionToBbox,
} from '../features/events/filters';
import { EonetEvent, EventQuery } from '../types/events';

const INITIAL_REGION: Region = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 100,
  longitudeDelta: 100,
};

export default function EventsMapScreen() {
  const [filters, setFilters] = useState<FilterState>(createDefaultFilters());
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [selectedEvent, setSelectedEvent] = useState<EonetEvent | null>(null);
  const filterSheetRef = useRef<BottomSheet>(null);
  const detailsSheetRef = useRef<BottomSheet>(null);

  // Build query from filters and region
  const query: EventQuery = useMemo(() => {
    const q: EventQuery = {
      start: filters.start,
      end: filters.end,
      categories: filters.categories.length > 0 ? filters.categories : undefined,
      status: 'all',
      limit: 100,
    };

    if (filters.viewportOnly) {
      q.bbox = regionToBbox(region);
    }

    return q;
  }, [filters, region]);

  // Fetch events with debouncing
  const { data: events, loading, error } = useEvents(query);

  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const openFilters = () => {
    filterSheetRef.current?.expand();
  };

  const handleMarkerPress = (event: EonetEvent) => {
    setSelectedEvent(event);
    detailsSheetRef.current?.expand();
  };

  // Get markers for events (use first geometry point)
  const markers = useMemo(() => {
    return events
      .map((event) => {
        const firstGeometry = event.geometry[0];
        if (!firstGeometry || firstGeometry.type !== 'Point') {
          return null;
        }

        const [longitude, latitude] = firstGeometry.coordinates;

        return {
          id: event.id,
          title: event.title,
          description: event.description || undefined,
          coordinate: { latitude, longitude },
          category: event.categories[0]?.title || 'Unknown',
        };
      })
      .filter((m) => m !== null);
  }, [events]);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={INITIAL_REGION}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton
      >
        {markers.map((marker) => {
          const event = events.find((e) => e.id === marker.id);
          return (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
              pinColor="#ef4444"
              onPress={() => event && handleMarkerPress(event)}
            />
          );
        })}
      </MapView>

      {/* Timeline Bar */}
      {!loading && events.length > 0 && (
        <View style={styles.timelineContainer}>
          <TimelineBar
            events={events}
            startDate={filters.start}
            endDate={filters.end}
          />
        </View>
      )}

      {/* Event Counter */}
      <View style={styles.counter}>
        {loading ? (
          <View style={styles.counterContent}>
            <ActivityIndicator size="small" color="#2dd4bf" />
            <Text style={styles.counterText}>Loading...</Text>
          </View>
        ) : (
          <Text style={styles.counterText}>Events: {events.length}</Text>
        )}
      </View>

      {/* Filter Button */}
      <Pressable style={styles.filterButton} onPress={openFilters}>
        <Text style={styles.filterButtonText}>⚙️ Filters</Text>
      </Pressable>

      {/* Error Toast */}
      {error && (
        <View style={styles.errorToast}>
          <Text style={styles.errorText}>
            {error.message || 'Failed to load events'}
          </Text>
        </View>
      )}

      {/* Filter Bottom Sheet */}
      <BottomSheet
        ref={filterSheetRef}
        index={-1}
        snapPoints={['80%']}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <EventsFilter filters={filters} onChange={handleFilterChange} />
      </BottomSheet>

      {/* Details Bottom Sheet */}
      <BottomSheet
        ref={detailsSheetRef}
        index={-1}
        snapPoints={['70%']}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
          />
        )}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
        onClose={() => setSelectedEvent(null)}
      >
        <EventDetailsSheet
          event={selectedEvent}
          onClose={() => detailsSheetRef.current?.close()}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  map: {
    flex: 1,
  },
  timelineContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 0,
    right: 0,
  },
  counter: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 180 : 140,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  counterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    backgroundColor: '#2dd4bf',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  filterButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '600',
  },
  errorToast: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 180 : 160,
    left: 20,
    right: 20,
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomSheetBackground: {
    backgroundColor: 'transparent',
  },
  bottomSheetIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

