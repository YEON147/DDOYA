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
import { useAuthStore } from '@/src/store/authStore';
import * as Notifications from 'expo-notifications';
import { notificationService } from '@/src/services/notificationService';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

// 알림이 도착했을 때(포그라운드) 어떻게 보여줄지 설정합니다.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

  useEffect(() => {
    void useAuthStore.getState().loadToken();
  }, []);

  // 알림 리스너 및 초기화 로직
  useEffect(() => {
    // 1. 로그인 상태라면 서버와 토큰 동기화 시도
    const authStore = useAuthStore.getState();
    if (authStore.isLoggedIn) {
      notificationService.syncTokenWithServer();
    }

    // 2. 알림 수신 리스너 (포그라운드 환경)
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('알림 수신:', notification);
    });

    // 3. 알림 클릭 리스너 (알림바 클릭 시 동작)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('알림 클릭:', response);
      // TODO: 필요한 경우 특정 화면으로 내비게이션 로직 추가
    });

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

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