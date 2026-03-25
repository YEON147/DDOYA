import { View, Text, Image, Pressable } from 'react-native';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';

type PillSlotProps = {
  name: string;
  count: number;
  image: any;
  taken: boolean;
  onPress?: () => void;
};

export function PillSlot({ name, count, image, taken, onPress }: PillSlotProps) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={[
            neuRaised(14, colors.surface),
            {
              width: 80,
              padding: 8,
              alignItems: 'center',
              gap: 4,
              opacity: pressed ? 0.92 : 1,
              borderWidth: taken ? 2 : 0,
              borderColor: taken ? '#5a9e5a' : 'transparent',
            },
          ]}
        >
          {taken && (
            <View
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 7,
                height: 7,
                borderRadius: 99,
                backgroundColor: '#5a9e5a',
              }}
            />
          )}
          <Image source={image} style={{ width: 46, height: 46, borderRadius: 10 }} />
          <Text style={{ fontSize: 11, color: colors.text, fontFamily: 'SCoreDreamMedium' }}>{name}</Text>
          <Text style={{ fontSize: 10, color: colors.text, fontFamily: 'SCoreDreamMedium' }}>{count}정</Text>
        </View>
      )}
    </Pressable>
  );
}
