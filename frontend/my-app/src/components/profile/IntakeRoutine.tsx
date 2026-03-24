import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme/colors';
import { neuInset, neuRaised } from '@/constants/theme/neumorphism';
import { useIntakeRoutineList } from '@/hooks/useIntakeRoutine';

/** 마이페이지 — 섭취 루틴 카드 (와이어: 베이지 카드 + 시간 pill) */
export function IntakeRoutine() {
  const router = useRouter();
  const { data: routineTimes, isLoading, isError } = useIntakeRoutineList();

  return (
    <View className="px-1">
      <View className="px-5 py-5" style={neuRaised(24, colors.surface)}>
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-[20px] font-scdream-medium" style={{ color: colors.text }}>
            섭취 루틴
          </Text>
          <Pressable
            onPress={() => router.push('/intake-routine-edit' as any)}
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
          {isLoading && (
            <View className="py-6">
              <ActivityIndicator color={colors.primary} />
            </View>
          )}

          {isError && (
            <View className="py-6 items-center">
              <Text style={{ color: colors.textMuted }}>데이터 로드 실패</Text>
            </View>
          )}

          {!isLoading && !isError && routineTimes && routineTimes.length === 0 && (
            <View className="py-6 items-center">
              <Text style={{ color: colors.textMuted }}>설정된 루틴이 없습니다.</Text>
            </View>
          )}

          {!isLoading && !isError && routineTimes?.map((t, index) => (
            <View
              key={t.userIntakeTimingSettingId}
              className="flex-row items-center justify-between px-4 py-3.5"
              style={{
                backgroundColor: colors.input,
                borderBottomWidth: index === routineTimes.length - 1 ? 0 : 1,
                borderBottomColor: `${colors.shadowDark}33`,
              }}
            >
              <Text className="text-[14px] font-scdream" style={{ color: colors.textMuted }}>
                {t.intakeTiming}
              </Text>
              <Text className="text-[14px] font-scdream-medium" style={{ color: colors.text }}>
                {t.intakeTime}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
