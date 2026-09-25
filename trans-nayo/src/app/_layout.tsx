import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { AppStoreProvider, useAppStore } from '@/store/app-store';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { hydrated, user } = useAppStore();

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated]);

  if (!hydrated) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="search" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="ride/options" />
        <Stack.Screen name="ride/tracking" options={{ gestureEnabled: false }} />
        <Stack.Screen name="ride/complete" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="topup" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppStoreProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </AppStoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
