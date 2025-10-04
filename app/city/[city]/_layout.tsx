import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Tabs, useLocalSearchParams } from 'expo-router';
import { CloudSun, Home } from 'lucide-react-native';
import React from 'react';

export default function CityTabsLayout() {
  const { city } = useLocalSearchParams<{ city: string }>();
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerTitle: city, // show city name in the header
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: { backgroundColor: '#000' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => <CloudSun color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}