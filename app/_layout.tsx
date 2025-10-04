import CustomDrawer from '@/components/CustomDrawer';
import { CitiesProvider } from '@/contexts/CitiesContext';
import { MapLayerProvider } from '@/contexts/MapLayerContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <MapLayerProvider>
      <CitiesProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Drawer
            drawerContent={(props) => <CustomDrawer {...props} />}
            screenOptions={{
              headerShown: false,
              drawerStyle: { backgroundColor: '#111', width: 280 },
            }}
          >
            {/* One screen that hosts a Stack which includes BOTH your map and city routes */}
            <Drawer.Screen name="(stack)" options={{ drawerLabel: 'Map' }} />
          </Drawer>
        </GestureHandlerRootView>
      </CitiesProvider>
      </MapLayerProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}