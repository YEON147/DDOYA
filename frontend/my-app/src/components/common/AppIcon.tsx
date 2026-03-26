import type { ComponentProps } from 'react';
import { type LucideIcon } from 'lucide-react-native';
import { colors } from '@/constants/theme/colors';

type AppIconProps = {
  icon: LucideIcon;
  size?: number;
  color?: string;
  strokeWidth?: number;
} & Omit<ComponentProps<LucideIcon>, 'size' | 'color' | 'strokeWidth'>;

export function AppIcon({
  icon: Icon,
  size = 20,
  color = colors.text,
  strokeWidth = 1.75,
  ...rest
}: AppIconProps) {
  return <Icon size={size} color={color} strokeWidth={strokeWidth} {...rest} />;
}
