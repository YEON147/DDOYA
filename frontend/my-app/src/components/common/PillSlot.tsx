import { View, Text, Image, Pressable } from 'react-native';
import { colors } from '@/constants/theme/colors';

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
          style={{
            width: 80,
            borderRadius: 14,
            padding: 8,
            alignItems: 'center',
            gap: 4,
            backgroundColor: colors.background,
            // 오목한 느낌 — 방향 반전
            shadowColor: taken ? '#5a9e5a' : '#C8B89A',
            shadowOffset: {
              width: pressed ? -3 : 3,
              height: pressed ? -3 : 3,
            },
            shadowOpacity: pressed ? 0 : 0.4,
            shadowRadius: 6,
            elevation: 0,
          }}
        >
          {/* 복용 완료 dot */}
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
          <Image
            source={image}
            style={{ width: 46, height: 46, borderRadius: 10 }}
          />
          <Text style={{ fontSize: 11, color: colors.text, fontFamily: 'scdream-medium' }}>{name}</Text>
          <Text style={{ fontSize: 10, color: colors.text, fontFamily: 'scdream-medium' }}>{count}정</Text>
        </View>
      )}
    </Pressable>
  );
}