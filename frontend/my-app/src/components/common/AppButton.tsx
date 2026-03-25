import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { cn } from '@/src/utils/cn';
import { colors } from '@/constants/theme/colors';
import { neuInset, neuRaised } from '@/constants/theme/neumorphism';

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'disabled';
}

export function AppButton({ title, variant = 'primary', className, disabled, ...props }: AppButtonProps) {
  const isDisabled = disabled || variant === 'disabled';

  return (
    <TouchableOpacity
      className={cn('h-14 items-center justify-center rounded-full', className)}
      style={[
        isDisabled
          ? neuInset(28, colors.input)
          : neuRaised(28, colors.point),
        { justifyContent: 'center', alignItems: 'center' },
      ]}
      disabled={isDisabled}
      activeOpacity={0.92}
      {...props}
    >
      <Text
        className={cn(
          'text-lg font-scdream',
          isDisabled ? 'text-gray-500' : 'text-white'
        )}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
