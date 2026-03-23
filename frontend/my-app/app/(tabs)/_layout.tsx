import { Platform } from 'react-native';
import { Redirect, Tabs, usePathname } from 'expo-router';

import { HapticTab } from '@/src/components/common/haptic-tab';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { colors } from '@/constants/theme/colors';
import { useColorScheme } from '@/hooks/theme/use-color-scheme';
import { useAuthStore } from '@/src/store/authStore';

const tabBarShadow = Platform.select({
  ios: {
    shadowColor: '#3F2207',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  android: {
    elevation: 8,
  },
  default: {},
});

/**
 * Expo Router의 pathname은 `(tabs)`·`(home)` 같은 route group을 경로에서 제거합니다.
 * 그래서 홈·프로필 index(메인)는 둘 다 `/`이고, 하위 화면만 `/intake-verify`, `/supplements` 등으로 구분됩니다.
 * @see expo-router build/global-state/routeInfo.js (group segment filter)
 */
function isMainTabPath(pathname: string): boolean {
  const path = pathname.split('?')[0].replace(/\/$/, '') || '/';
  return path === '/';
}

export default function TabLayout() {
  useColorScheme();
  const pathname = usePathname();
  const showTabBar = isMainTabPath(pathname);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const hasHydratedFromStorage = useAuthStore((s) => s.hasHydratedFromStorage);

  if (!hasHydratedFromStorage) {
    return null;
  }

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: `${colors.textMuted}AA`,
        tabBarStyle: showTabBar
          ? {
              backgroundColor: colors.surface,
              borderTopWidth: 0,
              ...tabBarShadow,
            }
          : { display: 'none' },
        tabBarItemStyle: {
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 8 : 10,
        },
        tabBarShowLabel: false,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: '프로필',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}