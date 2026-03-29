import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../constants/theme/colors';
import Logo from '../assets/images/ddoya_logo.svg';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { useAuthStore } from '@/src/store/authStore';

/** 개발 전용: .env.local에 EXPO_PUBLIC_DEV_SKIP_LOGIN=true 설정 시 로그인 생략 */
const devSkipLogin = __DEV__ && process.env.EXPO_PUBLIC_DEV_SKIP_LOGIN === 'true';

export default function LoadingScreen() {
  useEffect(() => {
    let cancelled = false;

    const initRoute = async () => {
      if (devSkipLogin) {
        router.replace('/(tabs)/(home)');
        return;
      }

      await useAuthStore.getState().loadToken();
      if (cancelled) return;

      const token = useAuthStore.getState().accessToken;

      if (token) {
        router.replace('/(tabs)/(home)');
      } else {
        router.replace('/(auth)/login');
      }
    };

    void initRoute();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ScreenContainer scrollable={false} padding={0}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Logo width={260} height={90} />
      </View>
    </ScreenContainer>
  );
}