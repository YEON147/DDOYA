import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../constants/theme/colors';
import Logo from '../assets/images/ddoya_logo.svg';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { useAuthStore } from '@/src/store/authStore';

export default function LoadingScreen() {
  useEffect(() => {
    let cancelled = false;

    const initRoute = async () => {
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