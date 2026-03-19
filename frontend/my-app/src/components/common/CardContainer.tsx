import { ReactNode } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@/constants/theme/colors';

type CardContainerProps = {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function CardContainer({ children, className = '', style }: CardContainerProps) {
  return (
    <View
      className={`rounded-3xl ${className}`.trim()}
      style={[
        {
          padding: 20,
          position: 'relative',
          backgroundColor: colors.background,
          borderWidth: 0.1,
          borderColor: 'rgba(220, 218, 218, 0.2)',
          shadowColor: '#C8B89A',
          shadowOffset: { width: 6, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 3,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}