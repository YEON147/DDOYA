import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '@/global.css';
import { colors } from '@/constants/theme/colors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { useColorScheme } from '@/hooks/theme/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SCoreDreamThin: require('../assets/fonts/SCDream1.otf'),
    SCoreDreamExtraLight: require('../assets/fonts/SCDream2.otf'),
    SCoreDreamLight: require('../assets/fonts/SCDream3.otf'),
    SCoreDreamRegular: require('../assets/fonts/SCDream4.otf'),
    SCoreDreamMedium: require('../assets/fonts/SCDream5.otf'),
    SCoreDreamBold: require('../assets/fonts/SCDream6.otf'),
    SCoreDreamExtraBold: require('../assets/fonts/SCDream7.otf'),
    SCoreDreamHeavy: require('../assets/fonts/SCDream8.otf'),
    SCoreDreamBlack: require('../assets/fonts/SCDream9.otf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const theme = {
    ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={theme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/signup-profile" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}