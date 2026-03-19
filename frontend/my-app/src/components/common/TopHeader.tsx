import { ReactNode } from 'react';
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
      className="px-6 py-4 flex-row items-center justify-between"
      style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(220, 218, 218, 0.35)' }}
    >
      <View className="flex-row items-center flex-1">
        {showBackButton && (
          <Pressable onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        )}
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          {title}
        </Text>
      </View>
      {right ? <View>{right}</View> : <View style={{ width: 32 }} />}
    </View>
  );
}
