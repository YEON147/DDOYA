// 탭 클릭시 진동 피드백 주는 탭바 컴포넌트(iOS 탭 버튼 효과)
import { Platform } from 'react-native';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

const softRipple =
  Platform.OS === 'android'
    ? { color: 'rgba(63, 34, 7, 0.07)', borderless: true, foreground: true }
    : undefined;

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      android_ripple={softRipple}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
