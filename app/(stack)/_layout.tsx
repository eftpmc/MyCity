import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(drawer)/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="city/[city]/(tabs)"
        options={{
          headerShown: false,
          animation: 'slide_from_right', // preserves your slide animation
        }}
      />
    </Stack>
  );
}