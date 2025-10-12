import React from 'react';
import {
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
    categories?: Array<{ id?: number | string; slug?: string; title?: string }>;
    geometry?: Array<{ coordinates?: number[]; date?: string; type?: string }>;
  };
}

// Web-compatible modal component
export function EventDetailModal({ visible, onClose, event }: EventDetailModalProps): React.JSX.Element {
  if (!visible) return <></>;

  const config = getCategoryConfig(event);

  const handleOpenLink = () => {
    if (event.link) {
      window.open(event.link, '_blank');
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { backgroundColor: config.color }]}>
              <Text style={styles.emoji}>{config.emoji}</Text>
            </View>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.category}>{config.name}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Event Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Event ID:</Text>
              <Text style={styles.detailValue}>{event.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{config.name}</Text>
            </View>
            {event.categories && event.categories.length > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>All Categories:</Text>
                <Text style={styles.detailValue}>
                  {event.categories.map((cat) => cat.title).join(', ')}
                </Text>
              </View>
            )}
          </View>

          {/* Location Information */}
          {event.geometry && event.geometry.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location Data</Text>
              {event.geometry.map((geom, index) => (
                <View key={index} style={styles.geometryItem}>
                  <Text style={styles.geometryType}>
                    {geom.type || 'Unknown Type'}
                  </Text>
                  {geom.coordinates && (
                    <Text style={styles.coordinates}>
                      Coordinates: {geom.coordinates.join(', ')}
                    </Text>
                  )}
                  {geom.date && (
                    <Text style={styles.date}>Date: {geom.date}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {event.link && (
              <TouchableOpacity style={styles.linkButton} onPress={handleOpenLink}>
                <Text style={styles.linkButtonText}>View Official Source</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.closeActionButton} onPress={onClose}>
              <Text style={styles.closeActionButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  emoji: {
    fontSize: 24,
    textAlign: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#aaa',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#aaa',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  geometryItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  geometryType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#aaa',
  },
  actions: {
    marginTop: 20,
    gap: 12,
  },
  linkButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeActionButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  closeActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
