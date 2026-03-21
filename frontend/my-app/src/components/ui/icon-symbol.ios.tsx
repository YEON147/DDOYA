import { ChevronRight, Code2, House, Send, User, type LucideIcon } from 'lucide-react-native';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';
import { AppIcon } from '@/src/components/common/AppIcon';

const MAPPING = {
  'house.fill': House,
  'person.fill': User,
  'paperplane.fill': Send,
  'chevron.left.forwardslash.chevron.right': Code2,
  'chevron.right': ChevronRight,
} as const satisfies Record<string, LucideIcon>;

type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: unknown;
}) {
  const Icon = MAPPING[name];
  return <AppIcon icon={Icon} color={color} size={size} style={style} />;
}
