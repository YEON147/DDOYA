import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme/colors';
import { AppIcon } from '@/src/components/common/AppIcon';

type TopHeaderProps = {
  /** 비우면 뒤로가기 옆 타이틀 미표시 */
  title?: string;
  right?: ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
};

export function TopHeader({
  title = '',
  right,
  showBackButton = true,
  onBackPress,
}: TopHeaderProps) {
  const router = useRouter();

  return (
    <View
      className="flex-row items-center justify-between px-6 py-4"
      style={{
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: `${colors.shadowDark}55`,
      }}
    >
      <View className="flex-1 flex-row items-center">
        {showBackButton && (
          <Pressable
            onPress={onBackPress ?? (() => router.back())}
            hitSlop={{ top: 16, bottom: 16, left: 12, right: 20 }}
            style={({ pressed }) => ({
              marginRight: title.trim() ? 4 : 0,
              paddingVertical: 4,
              paddingRight: 8,
              opacity: pressed ? 0.55 : 1,
            })}
          >
            <AppIcon icon={ChevronLeft} size={28} color={colors.text} />
          </Pressable>
        )}
        {title.trim() ? (
          <Text className="text-[23px] font-scdream-medium" style={{ color: colors.text }}>
            {title}
          </Text>
        ) : null}
      </View>
      {right ? <View>{right}</View> : <View style={{ width: 32 }} />}
    </View>
  );
}
