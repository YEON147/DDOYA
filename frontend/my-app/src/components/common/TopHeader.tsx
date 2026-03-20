import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme/colors';

type TopHeaderProps = {
  title: string;
  right?: ReactNode;
  showBackButton?: boolean;
};

export function TopHeader({
  title,
  right,
  showBackButton = true,
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
            onPress={() => router.back()}
            hitSlop={{ top: 16, bottom: 16, left: 12, right: 20 }}
            style={({ pressed }) => ({
              marginRight: 4,
              paddingVertical: 4,
              paddingRight: 8,
              opacity: pressed ? 0.55 : 1,
            })}
          >
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </Pressable>
        )}
        <Text className="text-[21px] font-scdream-medium" style={{ color: colors.text }}>
          {title}
        </Text>
      </View>
      {right ? <View>{right}</View> : <View style={{ width: 32 }} />}
    </View>
  );
}
