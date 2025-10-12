import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
  onPress?: () => void;
}

// Web-compatible version that doesn't use react-native-maps
export function EventMarker({ event, coordinate, onPress }: EventMarkerProps): React.JSX.Element {
  const config = getCategoryConfig(event);

  // For web, we'll return a simple view that can be positioned absolutely
  return (
    <View style={styles.markerContainer}>
      <View style={[styles.iconBackground, { backgroundColor: config.color }]}>
        <Text style={styles.emoji}>{config.emoji}</Text>
      </View>
      <View style={styles.shadow} />
    </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
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
