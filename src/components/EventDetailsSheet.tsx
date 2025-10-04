/**
 * Event Details Sheet Component
 * Shows detailed information about a selected event
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { EonetEvent } from '../types/events';
import { CategoryIcon } from './CategoryIcon';
import dayjs from 'dayjs';

interface EventDetailsSheetProps {
  event: EonetEvent | null;
  onClose: () => void;
}

export function EventDetailsSheet({ event, onClose }: EventDetailsSheetProps) {
  if (!event) {
    return null;
  }

  const firstGeometry = event.geometry[0];
  const lastGeometry = event.geometry[event.geometry.length - 1];
  const startDate = dayjs(firstGeometry.date).format('MMM D, YYYY');
  const endDate = event.closed
    ? dayjs(event.closed).format('MMM D, YYYY')
    : 'Ongoing';

  const handleSourcePress = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CategoryIcon categoryId={event.categories[0]?.id} size={28} />
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.value}>
            {event.categories.map((c) => c.title).join(', ')}
          </Text>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Date Range</Text>
          <Text style={styles.value}>
            {startDate} → {endDate}
          </Text>
        </View>

        {/* Description */}
        {event.description && (
          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>{event.description}</Text>
          </View>
        )}

        {/* Location */}
        {firstGeometry && firstGeometry.type === 'Point' && (
          <View style={styles.section}>
            <Text style={styles.label}>Coordinates</Text>
            <Text style={styles.value}>
              {firstGeometry.coordinates[1].toFixed(4)}°,{' '}
              {firstGeometry.coordinates[0].toFixed(4)}°
            </Text>
          </View>
        )}

        {/* Magnitude */}
        {firstGeometry?.magnitudeValue && (
          <View style={styles.section}>
            <Text style={styles.label}>Magnitude</Text>
            <Text style={styles.value}>
              {firstGeometry.magnitudeValue}{' '}
              {firstGeometry.magnitudeUnit || ''}
            </Text>
          </View>
        )}

        {/* Updates */}
        {event.geometry.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.label}>Updates</Text>
            <Text style={styles.value}>{event.geometry.length} updates</Text>
          </View>
        )}

        {/* Sources */}
        <View style={styles.section}>
          <Text style={styles.label}>Sources</Text>
          {event.sources.map((source, index) => (
            <Pressable
              key={index}
              onPress={() => handleSourcePress(source.url)}
              style={styles.sourceButton}
            >
              <Text style={styles.sourceText}>{source.id}</Text>
            </Pressable>
          ))}
        </View>

        {/* EONET Link */}
        <Pressable
          onPress={() => handleSourcePress(event.link)}
          style={styles.mainLinkButton}
        >
          <Text style={styles.mainLinkText}>View on EONET</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
  },
  closeText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
  },
  sourceButton: {
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2dd4bf',
  },
  sourceText: {
    color: '#2dd4bf',
    fontSize: 14,
    fontWeight: '500',
  },
  mainLinkButton: {
    backgroundColor: '#2dd4bf',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  mainLinkText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});
