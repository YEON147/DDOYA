import { View, Text, Pressable } from 'react-native';
import { Camera } from 'lucide-react-native';
import { colors } from '@/constants/theme/colors';
import { neuInset, neuRaised } from '@/constants/theme/neumorphism';

export type HomeIntakeSlotProps = {
  timeLabel: string;
  placeholderCount: number;
  onPressCamera?: () => void;
};

/** 홈 — 시간대별 섭취 인증 카드 (와이어프레임, 동작은 추후 연결) */
export function HomeIntakeSlot({ timeLabel, placeholderCount, onPressCamera }: HomeIntakeSlotProps) {
  return (
    <View>
      <View
        className="rounded-3xl px-3.5 py-3.5"
        style={neuRaised(26, colors.surface)}
      >
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View
              className="mr-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: colors.input, borderWidth: 1, borderColor: `${colors.shadowDark}40` }}
            >
              <Text className="text-[11px] font-scdream" style={{ color: colors.text }}>
                섭취 시간
              </Text>
            </View>
            <Text className="ml-2 text-[16px] font-scdream-medium" style={{ color: colors.text }}>
              {timeLabel}
            </Text>
          </View>
          <Pressable
            onPress={onPressCamera}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="h-8 w-8 items-center justify-center rounded-full"
            style={({ pressed }) => ({
              backgroundColor: colors.input,
              borderWidth: 1,
              borderColor: `${colors.shadowDark}44`,
              opacity: pressed ? 0.82 : 1,
            })}
          >
            <Camera size={15} color={colors.text} />
          </Pressable>
        </View>

        <View className="flex-row flex-wrap">
          {Array.from({ length: placeholderCount }).map((_, i) => (
            <View
              key={i}
              className="mb-2 rounded-xl p-1.5"
              style={[
                neuInset(12),
                {
                  width: '31.5%',
                  aspectRatio: 1,
                  marginRight: (i + 1) % 3 === 0 ? 0 : '2.75%',
                },
              ]}
            >
              <View
                className="mb-1.5 rounded-md"
                style={{
                  flex: 1,
                  minHeight: 40,
                  backgroundColor: `${colors.shadowLight}99`,
                  borderWidth: 1,
                  borderColor: `${colors.shadowDark}26`,
                }}
              />
              <View className="h-2 rounded-full" style={{ backgroundColor: `${colors.shadowDark}60` }} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
