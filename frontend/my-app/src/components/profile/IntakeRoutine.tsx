import { View, Text, Pressable } from 'react-native';
import { colors } from '@/constants/theme/colors';
import { neuInset, neuRaised } from '@/constants/theme/neumorphism';

/** 목업 시간 — 추후 루틴 API와 연동 */
const MOCK_ROUTINE_TIMES = ['오전 9:30', '오후 1:30', '오후 7:30'];

/** 마이페이지 — 섭취 루틴 카드 (와이어: 베이지 카드 + 시간 pill) */
export function IntakeRoutine() {
  return (
    <View className="px-1">
      <View className="px-5 py-5" style={neuRaised(24, colors.surface)}>
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-[20px] font-scdream-medium" style={{ color: colors.text }}>
            섭취 루틴
          </Text>
          <Pressable
            onPress={() => {}}
            hitSlop={8}
            style={({ pressed }) => [
              neuInset(999, colors.input),
              {
                paddingHorizontal: 12,
                paddingVertical: 7,
                opacity: pressed ? 0.88 : 1,
              },
            ]}
          >
            <Text className="text-[14px] font-scdream" style={{ color: colors.text }}>
              수정
            </Text>
          </Pressable>
        </View>

        <View className="overflow-hidden rounded-2xl" style={{ borderWidth: 1, borderColor: `${colors.shadowDark}44` }}>
          {MOCK_ROUTINE_TIMES.map((t) => (
            <View
              key={t}
              className="flex-row items-center justify-between px-4 py-3.5"
              style={{
                backgroundColor: colors.input,
                borderBottomWidth: t === MOCK_ROUTINE_TIMES[MOCK_ROUTINE_TIMES.length - 1] ? 0 : 1,
                borderBottomColor: `${colors.shadowDark}33`,
              }}
            >
              <Text className="text-[14px] font-scdream" style={{ color: colors.textMuted }}>
                섭취 시간
              </Text>
              <Text className="text-[14px] font-scdream-medium" style={{ color: colors.text }}>
                {t}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
