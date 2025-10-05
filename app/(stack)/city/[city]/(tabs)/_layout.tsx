// app/city/[city]/(tabs)/_layout.tsx
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs, useLocalSearchParams } from "expo-router";
import { Globe, Home } from "lucide-react-native";
import React from "react";

export default function CityTabsLayout() {
  const { city } = useLocalSearchParams<{ city: string }>();
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarStyle: { backgroundColor: "#000" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Overview",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size }) => <Globe color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}