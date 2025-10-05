import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import { getCategoryConfig } from './eventCategoryConfig';

interface EventMarkerProps {
  event: {
    id: string;
    title: string;
    categories?: Array<{ id?: number | string; slug?: string; title?: string }>;
  };
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

export function EventMarker({ event, coordinate }: EventMarkerProps): JSX.Element {
  const config = getCategoryConfig(event);
  const description = event.categories?.map((c) => c.title).join(', ') || '';

  return (
    <Marker
      coordinate={coordinate}
      title={event.title}
      description={description}
      anchor={{ x: 0.5, y: 0.5 }}
      centerOffset={{ x: 0, y: 0 }}
    >
      <View style={styles.markerContainer}>
        {/* Icon background circle */}
        <View style={[styles.iconBackground, { backgroundColor: config.color }]}>
          <Text style={styles.emoji}>{config.emoji}</Text>
        </View>
        {/* Optional: Add a small shadow/glow effect */}
        <View style={styles.shadow} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  emoji: {
    fontSize: 20,
    textAlign: 'center',
  },
  shadow: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    top: 2,
    zIndex: -1,
  },
});

