import type { ReactNode } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme/colors';

/** 탭 메인(스크롤)은 하단을 탭바가 담당 → top/좌우만. 풀스크린(스크롤 없음)은 시스템 내비와 겹침 방지를 위해 bottom 포함 */
const SAFE_EDGES_SCROLL = ['top', 'left', 'right'] as const;
const SAFE_EDGES_FULLSCREEN = ['top', 'left', 'right', 'bottom'] as const;

type ScreenContainerProps = {
  children: ReactNode;
  scrollable?: boolean;
  header?: ReactNode;
  padding?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollRef?: React.RefObject<ScrollView | null>;
};

export function ScreenContainer({
  children,
  scrollable = true,
  header,
  padding = 18,
  contentContainerStyle,
  scrollRef,
}: ScreenContainerProps) {
  const baseContentStyle = {
    paddingTop: padding,
    paddingHorizontal: padding,
    paddingBottom: 32,
  };

  const bg = colors.background;

  if (!scrollable) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: bg }} edges={SAFE_EDGES_FULLSCREEN}>
        {header}
        <View className="flex-1" style={{ padding, backgroundColor: bg }}>
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: bg }} edges={SAFE_EDGES_SCROLL}>
      {header}
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        style={{ backgroundColor: bg }}
        contentContainerStyle={[baseContentStyle, contentContainerStyle]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
