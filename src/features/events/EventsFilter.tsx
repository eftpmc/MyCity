/**
 * Events Filter UI Component
 * Allows filtering events by date range, categories, and viewport
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FilterState, CATEGORY_LABELS } from './filters';

interface EventsFilterProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClose?: () => void;
}

export function EventsFilter({
  filters,
  onChange,
  onClose,
}: EventsFilterProps) {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((c) => c !== categoryId)
      : [...filters.categories, categoryId];

    onChange({ ...filters, categories: newCategories });
  };

  const handleStartDateChange = (_event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      onChange({
        ...filters,
        start: selectedDate.toISOString().split('T')[0],
      });
    }
  };

  const handleEndDateChange = (_event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      onChange({
        ...filters,
        end: selectedDate.toISOString().split('T')[0],
      });
    }
  };

  const categories = Object.entries(CATEGORY_LABELS);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Events Filter</Text>
        {onClose && (
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Range</Text>

          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Start</Text>
              <Pressable
                onPress={() => setShowStartPicker(true)}
                style={styles.datePicker}
              >
                <Text style={styles.dateText}>{filters.start}</Text>
              </Pressable>
            </View>

            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>End</Text>
              <Pressable
                onPress={() => setShowEndPicker(true)}
                style={styles.datePicker}
              >
                <Text style={styles.dateText}>{filters.end}</Text>
              </Pressable>
            </View>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={new Date(filters.start)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
              maximumDate={new Date(filters.end)}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={new Date(filters.end)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEndDateChange}
              minimumDate={new Date(filters.start)}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map(([id, label]) => {
              const isActive = filters.categories.includes(id);
              return (
                <Pressable
                  key={id}
                  onPress={() => handleCategoryToggle(id)}
                  style={[styles.categoryPill, isActive && styles.categoryActive]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isActive && styles.categoryTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Viewport Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <Text style={styles.toggleTitle}>Current Map View Only</Text>
              <Text style={styles.toggleSubtitle}>
                Show events in visible region
              </Text>
            </View>
            <Switch
              value={filters.viewportOnly}
              onValueChange={(value) =>
                onChange({ ...filters, viewportOnly: value })
              }
              trackColor={{ false: '#4b5563', true: '#2dd4bf' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#d1d5db',
    marginBottom: 6,
  },
  datePicker: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dateText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryActive: {
    backgroundColor: '#2dd4bf',
    borderColor: '#2dd4bf',
  },
  categoryText: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#000000',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
});

