import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';

type CardContainerProps = {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function CardContainer({ children, className = '', style }: CardContainerProps) {
  return (
    <View
      className={`rounded-3xl ${className}`.trim()}
      style={[{ ...neuRaised(26, colors.surface), padding: 20 }, style]}
    >
      {children}
    </View>
  );
}
