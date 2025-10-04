/**
 * Timeline Bar Component
 * Visual timeline showing event distribution over time
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { EonetEvent } from '../types/events';
import dayjs from 'dayjs';

interface TimelineBarProps {
  events: EonetEvent[];
  startDate: string;
  endDate: string;
}

export function TimelineBar({ events, startDate, endDate }: TimelineBarProps) {
  const width = Dimensions.get('window').width - 40;

  const distribution = useMemo(() => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const totalDays = end.diff(start, 'day') + 1;
    const bucketCount = Math.min(Math.floor(width / 4), 50);
    const buckets = new Array(bucketCount).fill(0);

    events.forEach((event) => {
      const eventDate = dayjs(event.geometry[0].date);
      const daysFromStart = eventDate.diff(start, 'day');
      const bucketIndex = Math.floor((daysFromStart / totalDays) * bucketCount);

      if (bucketIndex >= 0 && bucketIndex < bucketCount) {
        buckets[bucketIndex]++;
      }
    });

    const maxCount = Math.max(...buckets, 1);
    return buckets.map((count) => count / maxCount);
  }, [events, startDate, endDate, width]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Event Timeline</Text>
      <View style={styles.timeline}>
        {distribution.map((height, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                height: Math.max(height * 40, 2),
                opacity: height > 0 ? 0.4 + height * 0.6 : 0.2,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.dateLabels}>
        <Text style={styles.dateLabel}>{dayjs(startDate).format('MMM D, YYYY')}</Text>
        <Text style={styles.dateLabel}>{dayjs(endDate).format('MMM D, YYYY')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    gap: 2,
  },
  bar: {
    flex: 1,
    backgroundColor: '#2dd4bf',
    borderRadius: 1,
  },
  dateLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dateLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
