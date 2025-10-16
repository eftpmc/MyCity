import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EnvironmentalDashboard } from '@/components/EnvironmentalDashboard';
import { CommentsSection } from '@/components/CommentsSection';
import { useEnvironmental } from '@/contexts/EnvironmentalContext';
import usCitiesData from '@/data/us_cities.json';

const usCities = usCitiesData as Array<{
  city: string;
  lat: string;
  lng: string;
  [key: string]: any;
}>;

export default function CityReportsPage() {
  const params = useLocalSearchParams();
  
  // Extract city name with robust handling - the city param is the city name string
  let cityName = Array.isArray(params.city) ? params.city[0] : params.city;
  const stateId = Array.isArray(params.state_id) ? params.state_id[0] : params.state_id;
  
  // Handle the case where [city] is passed literally or params are empty
  if (cityName === '[city]' || !cityName || Object.keys(params).length === 0) {
    // Try to extract city name from URL path
    const pathSegments = window?.location?.pathname?.split('/') || [];
    const cityIndex = pathSegments.findIndex(segment => segment === 'city');
    if (cityIndex !== -1 && pathSegments[cityIndex + 1]) {
      cityName = decodeURIComponent(pathSegments[cityIndex + 1]);
      console.log('[Reports] 🔧 Extracted city name from URL:', cityName);
    }
  }
  
  const { fetchEnvironmentalData, data: envData } = useEnvironmental();
  const [isInitialized, setIsInitialized] = useState(false);
  const [cityCoords, setCityCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
  
  // Debug logging (can be removed in production)
  console.log('[Reports] 🔍 City:', cityName, 'State:', stateId, 'Coords:', cityCoords ? 'Found' : 'Not found');

  useEffect(() => {
    if (!cityName || isInitialized) return;
    
    console.log('[Reports] 🔍 Looking up coordinates for:', cityName);
    
    // First, try to use coordinates from params if available (from navigation)
    const paramLat = Array.isArray(params.lat) ? params.lat[0] : params.lat;
    const paramLng = Array.isArray(params.lng) ? params.lng[0] : params.lng;
    
    if (paramLat && paramLng) {
      const lat = parseFloat(paramLat);
      const lon = parseFloat(paramLng);
      
      console.log('[Reports] ✅ Using coordinates from params:', lat, lon);
      
      // Store coordinates for nearby comments
      setCityCoords({ lat, lng: lon });
      
      // Fetch environmental data (async, happens in background)
      fetchEnvironmentalData(cityName, lat, lon);
      setIsInitialized(true);
      return;
    }
    
    // Fallback: Find city in local JSON data (instant lookup)
    // Try exact match first, then try with state if available
    console.log('[Reports] 🔍 Attempting exact match for:', cityName);
    let cityData = usCities.find((c) => 
      c.city.toLowerCase() === cityName.toLowerCase()
    );
    
    if (cityData) {
      console.log('[Reports] ✅ Exact match found:', cityData.city, cityData.state_id);
    } else {
      console.log('[Reports] ❌ No exact match found for:', cityName);
    }
    
    // If no exact match and we have state info, try with state
    if (!cityData && stateId) {
      cityData = usCities.find((c) => 
        c.city.toLowerCase() === cityName.toLowerCase() && 
        c.state_id === stateId
      );
    }
    
    // If still no match, try partial matching for common variations
    if (!cityData) {
      cityData = usCities.find((c) => {
        const cityLower = c.city.toLowerCase();
        const nameLower = cityName.toLowerCase();
        return cityLower.includes(nameLower) || nameLower.includes(cityLower);
      });
    }
    
    // If still no match, try with state context for better matching
    if (!cityData && stateId) {
      cityData = usCities.find((c) => {
        const cityLower = c.city.toLowerCase();
        const nameLower = cityName.toLowerCase();
        return (cityLower.includes(nameLower) || nameLower.includes(cityLower)) && c.state_id === stateId;
      });
    }

    if (cityData) {
      const lat = parseFloat(cityData.lat);
      const lon = parseFloat(cityData.lng);
      
      console.log('[Reports] ✅ Found coordinates in local data:', lat, lon, 'for city:', cityData.city, cityData.state_id);
      
      // Store coordinates for nearby comments
      setCityCoords({ lat, lng: lon });
      
      // Fetch environmental data (async, happens in background)
      fetchEnvironmentalData(cityName, lat, lon);
    } else {
      console.warn('[Reports] ⚠️ City not found in local data for:', cityName, stateId);
      console.log('[Reports] 🔍 Available cities with similar names:', 
        usCities.filter(c => c.city.toLowerCase().includes(cityName.toLowerCase())).slice(0, 5)
      );
      // Use center of US as fallback
      setCityCoords({ lat: 39.8283, lng: -98.5795 });
      fetchEnvironmentalData(cityName, 39.8283, -98.5795);
    }
    
    setIsInitialized(true);
  }, [cityName, isInitialized, fetchEnvironmentalData, params.lat, params.lng]);

  // Determine the display city name with multiple fallbacks
  let displayCityName = cityName || 'Loading...';
  
  // Additional fallback: try to extract from any available param
  if (displayCityName === 'Loading...' && params) {
    // Try different possible parameter names
    const possibleNames = ['city', 'cityName', 'name', 'title'];
    for (const key of possibleNames) {
      const value = Array.isArray(params[key]) ? params[key][0] : params[key];
      if (value && typeof value === 'string' && value !== 'Loading...') {
        displayCityName = value;
        console.log('[Reports] 🔄 Found city name in param:', key, '=', value);
        break;
      }
    }
  }
  
  // Final fallback: use the city name from environmental data if available
  if (displayCityName === 'Loading...' && envData && envData.cityName) {
    displayCityName = envData.cityName;
    console.log('[Reports] 🔄 Using city name from environmental data:', envData.cityName);
  }
  
  console.log('[Reports] 🎯 Final display city name:', displayCityName);
  
  // Always render the dashboard immediately
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <EnvironmentalDashboard cityName={displayCityName} />
        <CommentsSection cityName={displayCityName} cityCoords={cityCoords} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
});