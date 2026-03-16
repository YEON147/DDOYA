import { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../constants/theme/colors';
import Logo from '../assets/images/ddoya_logo.svg';

export default function LoadingScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Logo width={260} height={90} />
    </View>
  );
}