// components/CustomDrawer.tsx
import { useCities } from '@/contexts/CitiesContext';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function CustomDrawer(props : DrawerContentComponentProps) {
  const { cities } = useCities();
  const router = useRouter();

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      <Text style={styles.header}>My Cities</Text>

      {cities.length === 0 ? (
        <Text style={styles.empty}>No cities saved yet</Text>
      ) : (
        cities.map((city, index) => (
          <TouchableOpacity
            key={index}
            style={styles.cityItem}
            onPress={() => {
              // close drawer and navigate to detail
              props.navigation.closeDrawer();
              router.push({
                pathname: '/city/[city]',
                params: { ...city },
              });
            }}
          >
            <Text style={styles.cityText}>
              {city.city}, {city.state_id}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#111', flex: 1 },
  header: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    marginLeft: 16,
  },
  empty: {
    color: '#888',
    marginLeft: 16,
  },
  cityItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cityText: {
    color: '#fff',
    fontSize: 16,
  },
});