import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EnvironmentalDashboard } from '@/components/EnvironmentalDashboard';
import { useEnvironmental } from '@/contexts/EnvironmentalContext';
import usCitiesData from '@/data/us_cities.json';

const usCities = usCitiesData as Array<{
  city: string;
  lat: string;
  lng: string;
  [key: string]: any;
}>;

export default function CityReportsPage() {
  const { city } = useLocalSearchParams<{ city: string }>();
  const { fetchEnvironmentalData } = useEnvironmental();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!city || isInitialized) return;
    
    console.log('[Reports] 🔍 Looking up coordinates for:', city);
    
    // Find city in local JSON data (instant lookup)
    const cityData = usCities.find((c) => 
      c.city.toLowerCase() === (city as string).toLowerCase()
    );

    if (cityData) {
      const lat = parseFloat(cityData.lat);
      const lon = parseFloat(cityData.lng);
      
      console.log('[Reports] ✅ Found coordinates:', lat, lon);
      
      // Fetch environmental data (async, happens in background)
      fetchEnvironmentalData(city as string, lat, lon);
      setIsInitialized(true);
    } else {
      console.warn('[Reports] ⚠️ City not found, using default coordinates');
      // Use center of US as fallback
      fetchEnvironmentalData(city as string, 39.8283, -98.5795);
      setIsInitialized(true);
    }
  }, [city, isInitialized, fetchEnvironmentalData]);

  // Always render the dashboard immediately
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <EnvironmentalDashboard cityName={city as string} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
});