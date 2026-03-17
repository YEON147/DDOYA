import { Pressable, Text, View } from 'react-native';
import { colors } from '@/constants/theme/colors';

type ProfileMenuButtonProps = {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
};

export function ProfileMenuButton({
  label,
  icon,
  onPress,
}: ProfileMenuButtonProps) {
  return (
    <Pressable onPress={onPress} className="items-center">
      <View
        className="h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.background }}
      >
        {icon}
      </View>
      <Text
        className="mt-3 text-[15px] font-scdream"
        style={{ color: colors.text }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
