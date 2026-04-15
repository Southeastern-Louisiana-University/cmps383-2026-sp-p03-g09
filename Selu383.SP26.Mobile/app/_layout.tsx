import { ThemeProvider } from '@/app/theme-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="pages/rewards"/>
        <Stack.Screen name="pages/signup"/>
        <Stack.Screen name="pages/login"/>
        <Stack.Screen name="pages/settings"/>
        <Stack.Screen name="pages/orderConfirmation"/>
        <Stack.Screen name="pages/tiers"/>
        <Stack.Screen name="pages/stores"/>
        <Stack.Screen name="pages/forgotpass"/>
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
