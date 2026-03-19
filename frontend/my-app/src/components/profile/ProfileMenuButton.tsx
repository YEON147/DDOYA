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
      {({ pressed }) => (
        <>
          <View
            className="h-16 w-16 rounded-full"
            style={{
              backgroundColor: pressed ? '#F0EDE4' : colors.background,
              borderWidth: 0.1,
              borderColor: 'rgba(220, 218, 218, 0.2)',
              shadowColor: '#C8B89A',
              shadowOffset: { width: 6, height: 6 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: pressed ? '#F0EDE4' : colors.background,
              }}
            >
              {icon}
            </View>
          </View>
          <Text
            className="mt-3 text-sm font-scdream-medium"
            style={{ color: colors.text }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}