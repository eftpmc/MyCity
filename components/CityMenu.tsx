import { City } from '@/types';
import { LogIn, X, ZoomIn } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  selectedCity: City | null;
  nearestCity: City | null;
  zoomLevel: number;
  flyToCity: (c: City) => void;
  setSelectedCity: (c: City | null) => void;
  router: any;
}

export default function CityMenu({
  selectedCity,
  nearestCity,
  zoomLevel,
  flyToCity,
  setSelectedCity,
  router,
}: Props) {
  if (selectedCity) {
    return (
      <View style={styles.bottomWrap}>
        <View style={styles.bottomMenu}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.bottomTitle}>{selectedCity.city}</Text>
            <Text style={styles.bottomSubtitle}>
              {selectedCity.state_name} ({selectedCity.state_id})
            </Text>
          </View>

          <TouchableOpacity style={styles.iconBtn} onPress={() => setSelectedCity(null)}>
            <X size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => flyToCity(selectedCity)}>
            <ZoomIn size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push({ pathname: '/city/[city]', params: { ...selectedCity } })}
          >
            <LogIn size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (nearestCity && zoomLevel < 2) {
    return (
      <View style={styles.quickResultWrap}>
        <TouchableOpacity style={styles.resultItem} onPress={() => flyToCity(nearestCity)}>
          <Text style={styles.resultTitle}>{nearestCity.city}</Text>
          <Text style={styles.resultSubtitle}>
            {nearestCity.state_name} ({nearestCity.state_id})
          </Text>
          {nearestCity.population && (
            <Text style={styles.resultSubtitle}>
              Pop. {nearestCity.population.toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  bottomWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 48,
    alignItems: 'center',
    zIndex: 3,
  },
  bottomMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    minWidth: 260,
    maxWidth: 340,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  bottomTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  bottomSubtitle: { color: '#9a9a9a', fontSize: 12, marginTop: 2 },
  iconBtn: {
    width: 36,
    height: 36,
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: '#2c2c2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultItem: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  resultTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resultSubtitle: { color: '#9a9a9a', fontSize: 13, marginTop: 2 },
  quickResultWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 48, // move near bottom like the selected city menu
    alignItems: 'center',
    zIndex: 3,
  },
});