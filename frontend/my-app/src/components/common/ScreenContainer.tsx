import { ReactNode } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme/colors';

type ScreenContainerProps = {
  children: ReactNode;
  scrollable?: boolean;
  header?: ReactNode;
  padding?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function ScreenContainer({
  children,
  scrollable = true,
  header,
  padding = 18,
  contentContainerStyle,
}: ScreenContainerProps) {
  const baseContentStyle = {
    padding,
    paddingBottom: 32,
  };

  if (!scrollable) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
        {header}
        <View className="flex-1" style={{ padding }}>
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {header}
      <ScrollView
        className="flex-1"
        contentContainerStyle={[baseContentStyle, contentContainerStyle]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
