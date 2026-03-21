import { Platform } from 'react-native';
import { Tabs } from 'expo-router';

import { HapticTab } from '@/src/components/common/haptic-tab';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { colors } from '@/constants/theme/colors';
import { useColorScheme } from '@/hooks/theme/use-color-scheme';

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

export default function TabLayout() {
  useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: `${colors.textMuted}AA`,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          ...tabBarShadow,
        },
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