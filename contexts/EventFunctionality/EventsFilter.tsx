import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  TextInput,
} from 'react-native';
import { FilterState, CATEGORY_MAP } from '../EventContext';

interface EventsFilterProps {
  value: FilterState;
  onChange: (f: FilterState) => void;
}

export function EventsFilter({ value, onChange }: EventsFilterProps): React.JSX.Element {
  const [startText, setStartText] = useState(value.start);
  const [endText, setEndText] = useState(value.end);

  const handleStartChange = (text: string) => {
    setStartText(text);
    // Update immediately on blur or when valid
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      onChange({ ...value, start: text });
    }
  };

  const handleEndChange = (text: string) => {
    setEndText(text);
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      onChange({ ...value, end: text });
    }
  };

  const handleStartBlur = () => {
    // Validate and update on blur
    if (/^\d{4}-\d{2}-\d{2}$/.test(startText)) {
      onChange({ ...value, start: startText });
    } else {
      // Reset to valid value if invalid
      setStartText(value.start);
    }
  };

  const handleEndBlur = () => {
    // Validate and update on blur
    if (/^\d{4}-\d{2}-\d{2}$/.test(endText)) {
      onChange({ ...value, end: endText });
    } else {
      // Reset to valid value if invalid
      setEndText(value.end);
    }
  };

  // Quick date range presets
  const setDateRange = (months: number) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    setStartText(startStr);
    setEndText(endStr);
    onChange({ ...value, start: startStr, end: endStr });
  };

  const toggleCategory = (slug: string) => {
    const newCategories = value.categories.includes(slug)
      ? value.categories.filter((c) => c !== slug)
      : [...value.categories, slug];
    onChange({ ...value, categories: newCategories });
  };

  const toggleViewportOnly = () => {
    onChange({ ...value, viewportOnly: !value.viewportOnly });
  };

  const isAllSelected = value.categories.length === Object.values(CATEGORY_MAP).length;

  const toggleAll = () => {
    if (isAllSelected) {
      // Deselect all (keep at least one to avoid empty queries)
      onChange({ ...value, categories: [Object.values(CATEGORY_MAP)[0]] });
    } else {
      // Select all
      onChange({ ...value, categories: Object.values(CATEGORY_MAP) });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Event Filters</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Date Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          
          {/* Quick Presets */}
          <View style={styles.presetRow}>
            <TouchableOpacity style={styles.presetBtn} onPress={() => setDateRange(1)}>
              <Text style={styles.presetText}>1M</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetBtn} onPress={() => setDateRange(3)}>
              <Text style={styles.presetText}>3M</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetBtn} onPress={() => setDateRange(6)}>
              <Text style={styles.presetText}>6M</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.presetBtn} onPress={() => setDateRange(12)}>
              <Text style={styles.presetText}>1Y</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>Start</Text>
              <TextInput
                style={styles.input}
                value={startText}
                onChangeText={handleStartChange}
                onBlur={handleStartBlur}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>End</Text>
              <TextInput
                style={styles.input}
                value={endText}
                onChangeText={handleEndChange}
                onBlur={handleEndBlur}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.categoryHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={toggleAll} style={styles.selectAllBtn}>
              <Text style={styles.selectAllText}>
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pillContainer}>
            {Object.entries(CATEGORY_MAP).map(([label, slug]) => {
              const isSelected = value.categories.includes(slug);
              return (
                <TouchableOpacity
                  key={slug}
                  style={[styles.pill, isSelected && styles.pillSelected]}
                  onPress={() => toggleCategory(slug)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Viewport Only Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <Text style={styles.toggleTitle}>Viewport Only</Text>
              <Text style={styles.toggleSubtitle}>
                Only list events in current map view
              </Text>
            </View>
            <Switch
              value={value.viewportOnly}
              onValueChange={toggleViewportOnly}
              trackColor={{ false: '#767577', true: '#4A90E2' }}
              thumbColor={value.viewportOnly ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
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
    borderRadius: 14,
    overflow: 'hidden',
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    maxHeight: 500,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.4)',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  selectAllText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pillSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  pillText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  pillTextSelected: {
    color: '#fff',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 16,
  },
});

