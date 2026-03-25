import type { ReactNode } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme/colors';

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
    padding,
    paddingBottom: 32,
  };

  if (!scrollable) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        {header}
        <View className="flex-1" style={{ padding, backgroundColor: colors.background }}>
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {header}
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[baseContentStyle, contentContainerStyle]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
