import React from 'react';
import {
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getCategoryConfig } from './eventCategoryConfig';

interface EventDetailModalProps {
  visible: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    link?: string;
    description?: string;
    categories?: Array<{ id?: number | string; slug?: string; title?: string }>;
    geometry?: Array<{
      date: string;
      type: string;
      coordinates: [number, number];
      magnitudeValue?: number;
      magnitudeUnit?: string;
    }>;
    sources?: Array<{ id: string; url: string }>;
  } | null;
}

export function EventDetailModal({ visible, onClose, event }: EventDetailModalProps): React.JSX.Element {
  if (!event) return <></>;

  const config = getCategoryConfig(event);
  const categoryNames = event.categories?.map((c) => c.title).join(', ') || 'Unknown';

  // Clean up title: remove trailing numbers from generic event names
  // Example: "Wildfire in Brazil 1025052" → "Wildfire in Brazil"
  const cleanTitle = (title: string): string => {
    // Match pattern: "EventType in Location NUMBERS"
    const match = title.match(/^(.+?)\s+\d+$/);
    if (match) {
      return match[1].trim();
    }
    return title;
  };

  const displayTitle = cleanTitle(event.title);

  // Get date range
  const dates = event.geometry?.map((g) => new Date(g.date)).sort((a, b) => a.getTime() - b.getTime());
  const firstDate = dates?.[0];
  const lastDate = dates?.[dates.length - 1];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOpenSource = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.categoryIcon, { backgroundColor: config.color }]}>
              <Text style={styles.categoryEmoji}>{config.emoji}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.categoryLabel}>{categoryNames}</Text>
              <Text style={styles.title} numberOfLines={3}>
                {displayTitle}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Event Dates */}
            {firstDate && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📅 Event Timeline</Text>
                <View style={styles.dateBox}>
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>First Detected:</Text>
                    <Text style={styles.dateValue}>{formatDate(firstDate)}</Text>
                  </View>
                  {lastDate && lastDate.getTime() !== firstDate.getTime() && (
                    <View style={styles.dateRow}>
                      <Text style={styles.dateLabel}>Last Updated:</Text>
                      <Text style={styles.dateValue}>{formatDate(lastDate)}</Text>
                    </View>
                  )}
                  {dates && dates.length > 1 && (
                    <View style={styles.dateRow}>
                      <Text style={styles.dateLabel}>Updates:</Text>
                      <Text style={styles.dateValue}>{dates.length} total</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Initial Location */}
            {event.geometry && event.geometry.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📍 Initial Location</Text>
                <View style={styles.locationBox}>
                  {(() => {
                    const firstGeom = event.geometry[0];
                    const [lon, lat] = firstGeom.coordinates;
                    return (
                      <>
                        <View style={styles.locationRow}>
                          <Text style={styles.locationLabel}>Coordinates:</Text>
                          <Text style={styles.locationCoords}>
                            {lat.toFixed(4)}°, {lon.toFixed(4)}°
                          </Text>
                        </View>
                        <View style={styles.locationRow}>
                          <Text style={styles.locationLabel}>Detected:</Text>
                          <Text style={styles.locationValue}>
                            {new Date(firstGeom.date).toLocaleDateString()}
                          </Text>
                        </View>
                      </>
                    );
                  })()}
                </View>
              </View>
            )}

            {/* Magnitude (for applicable event types) */}
            {(() => {
              const geometryWithMagnitude = event.geometry?.filter((g: any) => g.magnitudeValue != null) || [];
              if (geometryWithMagnitude.length === 0) return null;

              const categorySlug = event.categories?.[0]?.title?.toLowerCase() || '';
              
              // VOLCANOES: Show progressive magnitude values
              if (categorySlug.includes('volcano') && geometryWithMagnitude.length > 1) {
                const getVEIScale = (vei: number) => {
                  if (vei === 0) return 'Non-explosive';
                  if (vei === 1) return 'Small';
                  if (vei === 2) return 'Moderate';
                  if (vei === 3) return 'Moderate-Large';
                  if (vei === 4) return 'Large';
                  if (vei === 5) return 'Very Large';
                  if (vei >= 6) return 'Colossal';
                  return '';
                };

                return (
                  <View style={styles.magnitudeSection}>
                    <Text style={styles.magnitudeSectionTitle}>🌋 VOLCANIC ACTIVITY PROGRESSION</Text>
                    <View style={styles.progressionContainer}>
                      {geometryWithMagnitude.map((geom: any, index: number) => (
                        <View key={index} style={styles.progressionItem}>
                          <Text style={styles.progressionDate}>
                            {new Date(geom.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </Text>
                          <View style={styles.progressionMagnitude}>
                            <Text style={styles.progressionVEI}>VEI {geom.magnitudeValue}</Text>
                            <Text style={styles.progressionScale}>{getVEIScale(geom.magnitudeValue)}</Text>
                          </View>
                          {index < geometryWithMagnitude.length - 1 && (
                            <Text style={styles.progressionArrow}>→</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                );
              }

              // FLOODS: Show water level/gauge data
              if (categorySlug.includes('flood')) {
                const latestGeom = geometryWithMagnitude[geometryWithMagnitude.length - 1];
                const waterLevel = latestGeom?.magnitudeValue;
                const unit = latestGeom?.magnitudeUnit || 'feet';

                if (waterLevel === undefined) return null;

                let statusText = '';
                let statusColor = '#4A90E2';
                
                // Estimate flood severity (generic thresholds)
                if (unit.toLowerCase().includes('feet') || unit.toLowerCase().includes('ft')) {
                  if (waterLevel > 40) {
                    statusText = 'MAJOR FLOODING';
                    statusColor = '#FF3B30';
                  } else if (waterLevel > 30) {
                    statusText = 'MODERATE FLOODING';
                    statusColor = '#FF9500';
                  } else if (waterLevel > 20) {
                    statusText = 'MINOR FLOODING';
                    statusColor = '#FFCC00';
                  } else {
                    statusText = 'ELEVATED WATER';
                    statusColor = '#4A90E2';
                  }
                }

                return (
                  <View style={styles.magnitudeSection}>
                    <Text style={styles.magnitudeSectionTitle}>🌊 WATER LEVEL</Text>
                    <View style={styles.magnitudeBox}>
                      <View style={styles.magnitudeRow}>
                        <Text style={styles.magnitudeValue}>{waterLevel}</Text>
                        <Text style={styles.magnitudeUnit}>{unit}</Text>
                      </View>
                      {statusText && (
                        <Text style={[styles.magnitudeScale, { color: statusColor }]}>
                          {statusText}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              }

              // OTHER EVENT TYPES: Standard magnitude display
              const geometry = geometryWithMagnitude[geometryWithMagnitude.length - 1];
              let icon = '📊';
              let label = 'Magnitude';
              let scaleInfo = '';
              let unit = geometry.magnitudeUnit || '';

              // Convert "kts" to "knots"
              if (unit.toLowerCase() === 'kts') {
                unit = 'knots';
              }

              if (categorySlug.includes('earthquake')) {
                icon = '🌍';
                label = 'Earthquake Magnitude';
                const mag = geometry.magnitudeValue;
                if (mag !== undefined) {
                  if (mag < 3.0) scaleInfo = 'Minor';
                  else if (mag < 4.0) scaleInfo = 'Light';
                  else if (mag < 5.0) scaleInfo = 'Moderate';
                  else if (mag < 6.0) scaleInfo = 'Strong';
                  else if (mag < 7.0) scaleInfo = 'Major';
                  else scaleInfo = 'Great';
                }
              } else if (categorySlug.includes('volcano')) {
                icon = '🌋';
                label = 'Volcanic Explosivity';
                const vei = geometry.magnitudeValue;
                if (vei !== undefined) {
                  if (vei === 0) scaleInfo = 'Non-explosive';
                  else if (vei === 1) scaleInfo = 'Small';
                  else if (vei === 2) scaleInfo = 'Moderate';
                  else if (vei === 3) scaleInfo = 'Moderate-Large';
                  else if (vei === 4) scaleInfo = 'Large';
                  else if (vei === 5) scaleInfo = 'Very Large';
                  else if (vei >= 6) scaleInfo = 'Colossal';
                }
              } else if (categorySlug.includes('storm')) {
                icon = '⛈️';
                label = 'Storm Intensity';
                const speed = geometry.magnitudeValue;
                if (speed !== undefined && (unit.toLowerCase() === 'knots' || unit.toLowerCase() === 'kts')) {
                  if (speed < 34) scaleInfo = 'Tropical Depression';
                  else if (speed < 64) scaleInfo = 'Tropical Storm';
                  else if (speed < 83) scaleInfo = 'Category 1 Hurricane';
                  else if (speed < 96) scaleInfo = 'Category 2 Hurricane';
                  else if (speed < 113) scaleInfo = 'Category 3 Hurricane';
                  else if (speed < 137) scaleInfo = 'Category 4 Hurricane';
                  else scaleInfo = 'Category 5 Hurricane';
                }
              }

              return (
                <View style={styles.magnitudeSection}>
                  <Text style={styles.magnitudeSectionTitle}>{icon} {label}</Text>
                  <View style={styles.magnitudeBox}>
                    <View style={styles.magnitudeRow}>
                      <Text style={styles.magnitudeValue}>{geometry.magnitudeValue}</Text>
                      {unit && (
                        <Text style={styles.magnitudeUnit}>{unit}</Text>
                      )}
                    </View>
                    {scaleInfo && (
                      <Text style={styles.magnitudeScale}>{scaleInfo}</Text>
                    )}
                  </View>
                </View>
              );
            })()}

            {/* Description */}
            {event.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>ℹ️ About This Event</Text>
                <View style={styles.descriptionBox}>
                  <Text style={styles.description}>{event.description}</Text>
                </View>
              </View>
            )}

            {/* Sources */}
            {event.sources && event.sources.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📰 Sources</Text>
                {event.sources.map((source, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.sourceButton}
                    onPress={() => handleOpenSource(source.url)}
                  >
                    <Text style={styles.sourceButtonText}>{source.id}</Text>
                    <Text style={styles.sourceArrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Event ID */}
            <View style={styles.footer}>
              <Text style={styles.eventId}>Event ID: {event.id}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  categoryEmoji: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  categoryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 24,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#fff',
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
    color: '#fff',
    marginBottom: 12,
  },
  dateBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  dateValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  locationBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  locationCoords: {
    fontSize: 13,
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '500',
  },
  locationValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  magnitudeSection: {
    marginBottom: 24,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(74, 144, 226, 0.3)',
  },
  magnitudeSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A90E2',
    marginBottom: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  magnitudeBox: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  magnitudeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  magnitudeValue: {
    fontSize: 64,
    color: '#fff',
    fontWeight: '800',
    marginRight: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  magnitudeUnit: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  magnitudeScale: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  progressionContainer: {
    paddingVertical: 12,
  },
  progressionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  progressionDate: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    minWidth: 60,
  },
  progressionMagnitude: {
    flex: 1,
    marginLeft: 12,
  },
  progressionVEI: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 2,
  },
  progressionScale: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  progressionArrow: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 8,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  sourceButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sourceButtonText: {
    fontSize: 14,
    color: '#fff',
  },
  sourceArrow: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  footer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  eventId: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

