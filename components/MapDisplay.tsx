import { EventDetailModal } from '@/contexts/EventFunctionality/EventDetailModal';
import { EventMarker } from '@/contexts/EventFunctionality/EventMarker';
import { useMapLayer } from '@/contexts/MapLayerContext';
import { City, EonetGeometry } from '@/types';
import * as Location from 'expo-location'; // ✅ import location
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet as RNStyleSheet } from 'react-native';
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
    <>
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
        onPress={onDeselectCity}
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
              title={city.city}
              description={city.state_name}
              onPress={() => onFlyToCity(city)}
            />
          ))}

          {/* 🗺️ EarthData GIBS layer */}
          {activeLayer && (
            <UrlTile
              urlTemplate={activeLayer.url.replace('{date}', selectedDate)}
              maximumZ={activeLayer.maxZoom ?? 9}
              zIndex={-1}
              tileSize={256}
            />
          )}
        </>
      </MapView>
    </>
  );
}