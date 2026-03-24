import { Pressable, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';
import { AppIcon } from '@/src/components/common/AppIcon';

type ProfileMenuButtonProps = {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'card' | 'flat';
  withBorder?: boolean;
};

/** 아이콘+라벨 전체 탭 — 외곽 Pressable 하나만 사용 (터치 안정) */
export function ProfileMenuButton({
  label,
  icon,
  onPress,
  variant = 'card',
  withBorder = false,
}: ProfileMenuButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      className={variant === 'flat' ? 'flex-row items-center px-2 py-3.5' : 'flex-row items-center rounded-2xl px-4 py-3.5'}
      style={[
        variant === 'card' ? neuRaised(16, colors.surface) : undefined,
        withBorder
          ? {
              borderBottomWidth: 1,
              borderColor: `${colors.shadowDark}2E`,
            }
          : undefined,
      ]}
    >
      {({ pressed }) => (
        <View className="w-full flex-row items-center" style={{ opacity: pressed ? 0.72 : 1 }}>
          <View className="mr-3 h-10 w-10 items-center justify-center">
            {icon}
          </View>
          <Text className="flex-1 text-[14px] font-scdream-medium" style={{ color: colors.text }}>
            {label}
          </Text>
          <AppIcon icon={ChevronRight} size={18} color={colors.textMuted} />
        </View>
      )}
    </Pressable>
  );
}
