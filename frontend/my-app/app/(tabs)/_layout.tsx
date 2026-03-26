import { Platform, View } from 'react-native';
import { Redirect, Tabs, usePathname } from 'expo-router';
import { House, UserRound } from 'lucide-react-native';

import { HapticTab } from '@/src/components/common/haptic-tab';
import { AppIcon } from '@/src/components/common/AppIcon';
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
          tabBarIcon: ({ color, focused }) => (
            <View
              className="items-center justify-center rounded-full"
              style={{
                width: 36,
                height: 36,
                backgroundColor: focused ? `${colors.primary}1A` : 'transparent',
              }}
            >
              <AppIcon icon={House} size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: '프로필',
          tabBarIcon: ({ color, focused }) => (
            <View
              className="items-center justify-center rounded-full"
              style={{
                width: 36,
                height: 36,
                backgroundColor: focused ? `${colors.primary}1A` : 'transparent',
              }}
            >
              <AppIcon icon={UserRound} size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}