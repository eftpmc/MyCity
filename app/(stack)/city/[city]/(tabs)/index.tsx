import { useCities } from '@/contexts/CitiesContext';
import { useEnvironmental } from '@/contexts/EnvironmentalContext';
import { default as rawCities, default as usCitiesData } from '@/data/us_cities.json';
import { City } from '@/types';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Map, Menu, Minus, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const allCities = usCitiesData as Array<{
  city: string;
  lat: string;
  lng: string;
  [key: string]: any;
}>;

const usCities = rawCities as City[];

export default function CityDetailsPage() {
  const { city: cityName, state_id } = useLocalSearchParams<{
    city: string;
    state_id: string;
  }>();

  const { addCity, removeCity, isAdded } = useCities();
  const { data: envData, fetchEnvironmentalData } = useEnvironmental();
  const navigation = useNavigation();
  const router = useRouter();
  
  // Temperature unit state
  const [useCelsius, setUseCelsius] = useState(false);
  
  // Helper functions for temperature conversion
  const fahrenheitToCelsius = (f: number) => Math.round((f - 32) * 5/9);
  const celsiusToFahrenheit = (c: number) => Math.round((c * 9/5) + 32);
  
  // Calculate daily highs and lows based on current temperature
  const getDailyHighsLows = () => {
    if (!envData.temperatureF) return { high: null, low: null };
    
    const currentTemp = envData.temperatureF;
    const hour = new Date().getHours();
    
    // Estimate daily range based on current temp and time of day
    let dailyHigh = currentTemp + 8; // Typical daily range
    let dailyLow = currentTemp - 12;
    
    // Adjust based on time of day
    if (hour >= 12 && hour <= 16) {
      // Afternoon - current temp might be close to high
      dailyHigh = currentTemp + 2;
      dailyLow = currentTemp - 10;
    } else if (hour >= 6 && hour <= 10) {
      // Morning - current temp rising from low
      dailyHigh = currentTemp + 6;
      dailyLow = currentTemp - 8;
    } else if (hour >= 20 || hour <= 4) {
      // Evening/Night - current temp might be close to low
      dailyHigh = currentTemp + 10;
      dailyLow = currentTemp - 2;
    }
    
    return {
      high: Math.round(dailyHigh),
      low: Math.round(dailyLow)
    };
  };
  
  const { high, low } = getDailyHighsLows();

  // Lookup the city object from dataset
  const city = usCities.find(
    (c) => c.city === cityName && c.state_id === state_id
  );

  // Fetch environmental data on mount
  useEffect(() => {
    if (city) {
      const cityData = allCities.find((c) => 
        c.city.toLowerCase() === city.city.toLowerCase()
      );
      
      if (cityData) {
        const lat = parseFloat(cityData.lat);
        const lon = parseFloat(cityData.lng);
        fetchEnvironmentalData(city.city, lat, lon);
      }
    }
  }, [city?.city]);

  if (!city) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ color: '#fff', padding: 20 }}>
          City not found
        </Text>
      </SafeAreaView>
    );
  }

  const added = isAdded(city);

  // Get weather icon based on conditions
const getWeatherIcon = () => {
  const code = envData.weatherCode;
  console.log(code)
  if (code == null) return '☁️';

  if (code === 0) return '☀️'; // Clear
  if ([1, 2, 3].includes(code)) return '⛅'; // Partly cloudy
  if ([45, 48].includes(code)) return '🌫️'; // Fog
  if ([51, 53, 55].includes(code)) return '🌦️'; // Drizzle
  if ([61, 63, 65].includes(code)) return '🌧️'; // Rain
  if ([71, 73, 75].includes(code)) return '🌨️'; // Snow
  if ([80, 81, 82].includes(code)) return '🌧️'; // Showers
  if ([95, 96, 99].includes(code)) return '⛈️'; // Thunderstorm
  return '☁️';
};

const getWeatherCondition = () => {
  if (envData.weatherDescription) return envData.weatherDescription;
  return 'Unknown';
};

  return (
    <SafeAreaView style={styles.container}>
      {/* Top controls: hamburger + map + add/remove button */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.squareButton}
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        >
          <Menu size={22} color="#fff" />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={styles.squareButton}
          onPress={() => router.replace('/')}
        >
          <Map size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.squareButton}
          onPress={() => (added ? removeCity(city) : addCity(city))}
        >
          {added ? (
            <Minus size={22} color="#fff" />
          ) : (
            <Plus size={22} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Header Info */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{city.city}</Text>
          <Text style={styles.subtitle}>
            {city.state_name} ({city.state_id})
          </Text>
        </View>
      </View>

      {/* Weather Section */}
      <View style={styles.section}>
        <View style={styles.weatherHeader}>
          <Text style={styles.sectionTitle}>Current Weather</Text>
          <TouchableOpacity 
            style={styles.tempToggleButton}
            onPress={() => setUseCelsius(!useCelsius)}
          >
            <Text style={styles.tempToggleText}>
              {useCelsius ? '°F' : '°C'}
            </Text>
          </TouchableOpacity>
        </View>
        {envData.temperatureF ? (
          <View style={styles.weatherCard}>
            <View style={styles.liveIndicator}>
              <View style={[styles.liveDot, envData.isEstimated && styles.estimatedDot]} />
              <Text style={[styles.liveText, envData.isEstimated && styles.estimatedText]}>
                {envData.isEstimated ? 'Estimated' : 'Live'}
              </Text>
            </View>
            
            <View style={styles.weatherMain}>
              <Text style={styles.weatherIcon}>{getWeatherIcon()}</Text>
              <View style={styles.weatherInfo}>
                <View style={styles.temperatureContainer}>
                  <Text style={styles.temperature}>
                    {useCelsius 
                      ? `${fahrenheitToCelsius(envData.temperatureF)}°C`
                      : `${Math.round(envData.temperatureF)}°F`
                    }
                  </Text>
                  <View style={styles.dailyRange}>
                    <Text style={styles.dailyHigh}>
                      H: {useCelsius 
                        ? `${fahrenheitToCelsius(high || 0)}°`
                        : `${high}°`
                      }
                    </Text>
                    <Text style={styles.dailyLow}>
                      L: {useCelsius 
                        ? `${fahrenheitToCelsius(low || 0)}°`
                        : `${low}°`
                      }
                    </Text>
                  </View>
                </View>
                <Text style={styles.weatherCondition}>{getWeatherCondition()}</Text>
              </View>
            </View>
            
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetailItem}>
                <Text style={styles.weatherDetailLabel}>Feels Like</Text>
                <Text style={styles.weatherDetailValue}>
                  {envData.temperatureF && envData.humidity 
                    ? (() => {
                        const feelsLikeF = Math.round(envData.temperatureF - (envData.humidity > 60 ? 2 : 0));
                        return useCelsius 
                          ? `${fahrenheitToCelsius(feelsLikeF)}°C`
                          : `${feelsLikeF}°F`;
                      })()
                    : '--'}
                </Text>
              </View>
              
              <View style={styles.weatherDetailItem}>
                <Text style={styles.weatherDetailLabel}>Humidity</Text>
                <Text style={styles.weatherDetailValue}>
                  {envData.humidity ? `${Math.round(envData.humidity)}%` : '--'}
                </Text>
              </View>
              
              <View style={styles.weatherDetailItem}>
                <Text style={styles.weatherDetailLabel}>Air Quality</Text>
                <Text style={[
                  styles.weatherDetailValue,
                  { color: envData.aqi && envData.aqi > 100 ? '#FF9500' : '#4CAF50' }
                ]}>
                  {envData.aqiCategory}
                </Text>
              </View>
            </View>
            
            <Text style={styles.weatherUpdate}>
              Updated: {envData.lastUpdated 
                ? new Date(envData.lastUpdated).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })
                : 'Never'}
            </Text>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading weather data...</Text>
          </View>
        )}
      </View>

      {/* Population Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Population</Text>
        <Text style={styles.populationText}>
          {city.population ? city.population.toLocaleString() : 'Data not available'}
        </Text>
      </View>

      {/* Coordinates Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coordinates</Text>
        <View style={styles.coords}>
          <Text style={styles.coordText}>Lat: {city.lat}</Text>
          <Text style={styles.coordText}>Lng: {city.lng}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },

  squareButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1c1c1e',
    alignItems: 'center',
    justifyContent: 'center',
  },

  header: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },

  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 18, color: '#aaa' },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tempToggleButton: {
    backgroundColor: '#1c1c1e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  tempToggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  temperatureContainer: {
    alignItems: 'center',
  },
  dailyRange: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  dailyHigh: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  dailyLow: {
    fontSize: 12,
    color: '#54A0FF',
    fontWeight: '500',
  },
  coords: { flexDirection: 'row', gap: 20 },
  coordText: { fontSize: 14, color: '#777' },
  populationText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  placeholder: { fontSize: 14, color: '#555' },

  // Weather Card Styles
  weatherCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2c2c2e',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  estimatedDot: {
    backgroundColor: '#FFA500',
  },
  estimatedText: {
    color: '#FFA500',
  },
  liveText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherIcon: {
    fontSize: 64,
    marginRight: 16,
  },
  weatherInfo: {
    flex: 1,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  weatherCondition: {
    fontSize: 20,
    color: '#aaa',
    fontWeight: '500',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2c2c2e',
    marginBottom: 12,
  },
  weatherDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  weatherDetailLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weatherDetailValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  weatherUpdate: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    gap: 12,
  },
  loadingText: {
    color: '#aaa',
    fontSize: 14,
  },
});