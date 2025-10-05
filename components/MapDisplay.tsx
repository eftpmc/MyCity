import { useMapLayer } from '@/contexts/MapLayerContext';
import { City, EonetGeometry } from '@/types';
import React, { useState } from 'react';
import { StyleSheet as RNStyleSheet } from 'react-native';
import MapView, { Marker, Region, UrlTile } from 'react-native-maps';
import { EventMarker } from '@/contexts/EventFunctionality/EventMarker';
import { EventDetailModal } from '@/contexts/EventFunctionality/EventDetailModal';

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
  const { selectedDate } = useMapLayer(); // ✅ grab date from context
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

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
      initialRegion={{
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 15,
        longitudeDelta: 15,
      }}
      onRegionChangeComplete={(region: Region) => {
        setZoomLevel(region.latitudeDelta);
        if (region.latitudeDelta < 2) {
          onRegionChange(region.latitude, region.longitude);
        }
        // Track region for event filtering
        if (onRegionChangeComplete) {
          onRegionChangeComplete(region);
        }
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
            urlTemplate={activeLayer.url.replace("{date}", selectedDate)}
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