import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { cn } from '../../lib/utils';

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'disabled';
}

export function AppButton({ title, variant = 'primary', className, disabled, ...props }: AppButtonProps) {
  const isDisabled = disabled || variant === 'disabled';

  return (
    <TouchableOpacity
      className={cn(
        'h-14 rounded-full items-center justify-center',
        isDisabled ? 'bg-gray-300' : 'bg-black',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      <Text className={cn(
        'text-lg font-scdream',
        isDisabled ? 'text-gray-500' : 'text-white'
      )}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
