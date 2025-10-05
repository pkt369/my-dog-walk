import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';

import { LocalizationProvider } from '@/lib/i18n';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <LocalizationProvider>
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="walk-session" options={{ headerShown: false }} />
          <Stack.Screen name="summary" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </>
    </LocalizationProvider>
  );
}
