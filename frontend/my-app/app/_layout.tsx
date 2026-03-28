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
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/theme/use-color-scheme';
import { useAuthStore } from '@/src/store/authStore';
import * as Notifications from 'expo-notifications';
import { notificationService } from '@/src/services/notificationService';
import { AppAlertProvider } from '@/src/components/common/AppAlertProvider';

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
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const hasHydratedFromStorage = useAuthStore((state) => state.hasHydratedFromStorage);

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

  // 로그인 상태 복원 완료 후, 알림 토큰 서버 동기화
  useEffect(() => {
    if (hasHydratedFromStorage && isLoggedIn) {
      notificationService.syncTokenWithServer();
    }
  }, [hasHydratedFromStorage, isLoggedIn]);

  // 알림 리스너 환경 구성
  useEffect(() => {
    // 1. 알림 수신 리스너 (포그라운드 환경)
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('💡 [DEBUG] 포그라운드 알림 낚아챔! 수신됨:', notification);
    });


    // 2. 알림 클릭 리스너 (알림바 클릭 시 동작)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('💡 [DEBUG] 클릭 데이터:', response.notification.request.content.data);

      const data = response.notification.request.content.data;

      // 알림 Data Payload에 맞춤 라우팅 처리
      if (data?.url) {
        // 백엔드에서 명시적 경로(ex '/reports')를 준 경우
        router.push(data.url as any);
      } else if (data?.type === 'INTAKE') {
        // 섭취/챙김 알림 -> 루틴 화면으로
        router.push('/(tabs)/(home)' as any);
      } else if (data?.type === 'STOCK' && data.supplementId) {
        // 재고 알림 -> 해당 영양제 상세 화면으로
        router.push(`/(tabs)/(profile)/supplements/${data.supplementId}` as any);
      }
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
      <AppAlertProvider>
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
      </AppAlertProvider>
    </QueryClientProvider>
  );
}