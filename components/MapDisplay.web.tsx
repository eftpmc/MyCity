import { useMapLayer } from '@/contexts/MapLayerContext';
import { City, EonetGeometry } from '@/types';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';

interface Props {
  mapRef: React.RefObject<any>;
  cities: City[];
  events: any[];
  activeLayer: any;
  onFlyToCity: (city: City) => void;
  onRegionChange: (lat: number, lng: number) => void;
  onDeselectCity: () => void;
  setZoomLevel: (z: number) => void;
  onRegionChangeComplete?: (region: any) => void;
}

// Web-compatible map component that shows a placeholder
export default function MapDisplay({
  mapRef,
  cities,
  events,
  activeLayer,
  onFlyToCity,
  onRegionChange,
  onDeselectCity,
  setZoomLevel,
  onRegionChangeComplete,
}: Props) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Simulate map region change for web
  useEffect(() => {
    // Set initial region
    const initialRegion = {
      latitude: 39.8283,
      longitude: -98.5795,
      latitudeDelta: 10,
      longitudeDelta: 10
    };
    
    if (onRegionChangeComplete) {
      onRegionChangeComplete(initialRegion);
    }
    
    setZoomLevel(4);
  }, []);

  return (
    <View style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapTitle}>🗺️ Interactive Map</Text>
        <Text style={styles.mapSubtitle}>
          {cities.length} cities • {events.length} events
        </Text>
        
        {/* Cities List */}
        <View style={styles.citiesList}>
          <Text style={styles.sectionTitle}>Major Cities</Text>
          {cities.slice(0, 6).map((city, index) => (
            <TouchableOpacity
              key={index}
              style={styles.cityItem}
              onPress={() => onFlyToCity(city)}
            >
              <Text style={styles.cityName}>{city.city}</Text>
              <Text style={styles.cityState}>{city.state_name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Events List */}
        <View style={styles.eventsList}>
          <Text style={styles.sectionTitle}>Recent Events</Text>
          {events.slice(0, 4).map((event, index) => (
            <TouchableOpacity
              key={index}
              style={styles.eventItem}
              onPress={() => {
                setSelectedEvent(event);
                setShowEventModal(true);
              }}
            >
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventCategory}>
                {event.categories?.map((c: any) => c.title).join(', ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Web Notice */}
        <View style={styles.webNotice}>
          <Text style={styles.webNoticeText}>
            🌐 Web Version - Full interactive map available in mobile app
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  mapSubtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 30,
  },
  citiesList: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  eventsList: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  cityItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cityState: {
    fontSize: 14,
    color: '#aaa',
  },
  eventItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  eventCategory: {
    fontSize: 12,
    color: '#4A90E2',
  },
  webNotice: {
    backgroundColor: '#1a3a5c',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  webNoticeText: {
    color: '#4A90E2',
    fontSize: 14,
    textAlign: 'center',
  },
});