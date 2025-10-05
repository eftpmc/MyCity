import { EventDetailModal } from '@/contexts/EventFunctionality/EventDetailModal';
import { EventMarker } from '@/contexts/EventFunctionality/EventMarker';
import { useMapLayer } from '@/contexts/MapLayerContext';
import { City, EonetGeometry } from '@/types';
import * as Location from 'expo-location'; // ✅ import location
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet as RNStyleSheet, View, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Region, UrlTile } from 'react-native-maps';

interface Props {
  mapRef: React.RefObject<MapView | null>;
  cities: City[];
  events: any[];
  activeLayer: any;
  onFlyToCity: (city: City) => void;
  onRegionChange: (lat: number, lng: number) => void;
  onDeselectCity: () => void;
  setZoomLevel: (z: number) => void;
  onRegionChangeComplete?: (region: Region) => void;
}

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
  const { selectedDate } = useMapLayer();
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 15,
    longitudeDelta: 15,
  });
  const [hasLocation, setHasLocation] = useState(false);
  const [focusedCity, setFocusedCity] = useState<City | null>(null);

  // 🌍 Get user location on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to center the map on your position.'
          );
          return;
        }

        const userLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = userLocation.coords;
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 5,
          longitudeDelta: 5,
        };

        setRegion(newRegion);
        setHasLocation(true);

        // Smoothly animate to user position
        mapRef.current?.animateToRegion(newRegion, 1500);
      } catch (err) {
        console.error('Error fetching user location:', err);
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <EventDetailModal
        visible={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
      />

      <MapView
        ref={mapRef}
        style={RNStyleSheet.absoluteFillObject}
        initialRegion={region}
        showsUserLocation={true} // ✅ shows user blue dot
        showsMyLocationButton={true}
        onRegionChangeComplete={(r: Region) => {
          setZoomLevel(r.latitudeDelta);
          if (r.latitudeDelta < 2) {
            onRegionChange(r.latitude, r.longitude);
          }
          setRegion(r);
          if (onRegionChangeComplete) onRegionChangeComplete(r);
        }}
        onPress={() => {
          onDeselectCity();
          setFocusedCity(null);
        }}
      >
        <>
          {/* 🌋 EONET Natural Events */}
          {events.map((ev, i) => {
            const geom = Array.isArray(ev.geometry)
              ? ev.geometry.find(
                  (g: EonetGeometry) =>
                    Array.isArray(g.coordinates) && g.coordinates.length >= 2
                )
              : null;

            if (!geom || !geom.coordinates) return null;
            const [lon, lat] = geom.coordinates;

            return (
              <EventMarker
                key={`event-${i}`}
                event={ev}
                coordinate={{ latitude: lat, longitude: lon }}
                onPress={() => setSelectedEvent(ev)}
              />
            );
          })}

          {/* 🏙️ City markers */}
          {cities.map((city, i) => (
            <Marker
              key={i}
              coordinate={{
                latitude: parseFloat(city.lat),
                longitude: parseFloat(city.lng),
              }}
              onPress={() => {
                setFocusedCity(city);
                onFlyToCity(city);
              }}
            />
          ))}

          {/* 🗺️ EarthData GIBS layer - ensure visibility at higher zooms and rerender on change */}
          {activeLayer && (
            <UrlTile
              key={`${activeLayer?.id || 'layer'}-${selectedDate}`}
              urlTemplate={activeLayer.url.replace('{date}', selectedDate)}
              minimumZ={0}
              maximumZ={activeLayer.maxZoom ?? 19}
              zIndex={-1}
              tileSize={256}
              shouldReplaceMapContent={false}
            />
          )}
        </>
      </MapView>

      {/* Bottom city info card when a city is focused */}
      {focusedCity && (
        <View style={styles.cityInfoContainer} pointerEvents="box-none">
          <View style={styles.cityInfoCard}>
            <Text style={styles.cityInfoTitle}>{focusedCity.city}</Text>
            <Text style={styles.cityInfoSubtitle}>
              {focusedCity.state_name} ({focusedCity.state_id})
            </Text>
            <TouchableOpacity
              onPress={() => setFocusedCity(null)}
              style={{ marginTop: 8, alignSelf: 'center' }}
            >
              <Text style={{ color: '#9aa0a6', fontSize: 12 }}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ➤ Recenter to user's location */}
      <TouchableOpacity
        style={styles.recenterBtn}
        activeOpacity={0.8}
        onPress={async () => {
          try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Denied', 'Location permission is required to recenter the map.');
              return;
            }
            const userLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const { latitude, longitude } = userLocation.coords;
            const target: Region = {
              latitude,
              longitude,
              latitudeDelta: 2.5,
              longitudeDelta: 2.5,
            };
            setRegion(target);
            mapRef.current?.animateToRegion(target, 800);
          } catch (e) {
            console.warn('Failed to recenter:', e);
          }
        }}
      >
        <Text style={styles.recenterText}>⌖</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = RNStyleSheet.create({
  cityInfoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16, // anchored at the bottom
    alignItems: 'center',
    zIndex: 6,
  },
  cityInfoCard: {
    backgroundColor: 'rgba(20,20,20,0.95)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cityInfoTitle: { color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  cityInfoSubtitle: { color: '#bdbdbd', fontSize: 12, marginTop: 4, textAlign: 'center' },
  recenterBtn: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  recenterText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
});