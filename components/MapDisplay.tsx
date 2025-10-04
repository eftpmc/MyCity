import { City, EonetGeometry } from '@/types';
import React from 'react';
import { StyleSheet as RNStyleSheet } from 'react-native';
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
}: Props) {
  return (
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
      }}
      onPress={onDeselectCity}
    >
      <>
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
            <Marker
              key={`event-${i}`}
              coordinate={{ latitude: lat, longitude: lon }}
              title={ev.title}
              description={ev.categories?.map((c: any) => c.title).join(', ')}
              pinColor="#ff7043"
            />
          );
        })}

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

        {activeLayer && (
          <UrlTile
            urlTemplate={activeLayer.url}
            maximumZ={activeLayer.maxZoom ?? 9}
            zIndex={-1}
            tileSize={256}
          />
        )}
      </>
    </MapView>
  );
}