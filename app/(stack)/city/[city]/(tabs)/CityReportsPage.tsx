import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function CityReportsPage() {
  const { city } = useLocalSearchParams<{ city: string }>();
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1️⃣ Get city coordinates
        const geoRes = await axios.get(
          `https://nominatim.openstreetmap.org/search?city=${city}&country=us&format=json`
        );
        if (!geoRes.data || geoRes.data.length === 0) {
          setError('City not found.');
          setLoading(false);
          return;
        }
        const { lat, lon } = geoRes.data[0];

        // 2️⃣ Get weather grid data endpoint
        const pointsRes = await axios.get(`https://api.weather.gov/points/${lat},${lon}`);
        const gridUrl = pointsRes.data?.properties?.forecastGridData;
        if (!gridUrl) {
          setError('Forecast grid data not available.');
          setLoading(false);
          return;
        }

        // 3️⃣ Fetch grid data (includes min/max temp arrays)
        const gridRes = await axios.get(gridUrl);
        const minTemps = gridRes.data?.properties?.minTemperature?.values || [];
        const maxTemps = gridRes.data?.properties?.maxTemperature?.values || [];

        // 4️⃣ Format for 5-day chart
        const formatted = minTemps.slice(0, 5).map((min: any, idx: number) => {
          const max = maxTemps[idx];
          const date = new Date(min.validTime.split('/')[0]);
          return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            min: min.value,
            max: max?.value || min.value,
          };
        });

        setForecastData(formatted);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch weather data.');
      } finally {
        setLoading(false);
      }
    };

    if (city) fetchWeather();
  }, [city]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#00ffcc" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!forecastData.length) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.placeholder}>No forecast data available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Text style={styles.title}>{city}</Text>
          <Text style={styles.subtitle}>5-Day Temperature Forecast</Text>

          <View style={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fill: '#aaa' }} />
                <YAxis tick={{ fill: '#aaa' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111',
                    borderColor: '#00ffcc',
                    borderRadius: 8,
                    color: '#fff',
                  }}
                />
                <Line type="monotone" dataKey="min" stroke="#00bfff" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="max" stroke="#ff6347" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </View>

          <Text style={styles.legend}>
            <Text style={{ color: '#00bfff' }}>●</Text> Min Temp 
            <Text style={{ color: '#ff6347' }}>●</Text> Max Temp
          </Text>
        </motion.div>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#bbb', marginBottom: 20 },
  chartContainer: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 10,
    width: '100%',
    shadowColor: '#00ffcc',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  legend: { color: '#ccc', marginTop: 15, fontSize: 14 },
  error: { color: 'red', fontSize: 16 },
  placeholder: { color: '#888', fontSize: 16 },
});