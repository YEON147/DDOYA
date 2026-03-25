import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/theme/colors';
import { neuInset, neuRaised } from '@/constants/theme/neumorphism';
import { useIntakeRoutineList } from '@/hooks/useIntakeRoutine';

/** 마이페이지 — 섭취 루틴 카드 (와이어: 베이지 카드 + 시간 pill) */
export function IntakeRoutine() {
  const router = useRouter();
  const { data: routineTimes, isLoading, isError } = useIntakeRoutineList();
  const totalCount = routineTimes?.length ?? 0;

  return (
    <View className="px-1">
      <View
        className="relative overflow-hidden rounded-3xl px-5 py-5"
        style={[neuRaised(24, colors.cardIvory), { borderWidth: 1, borderColor: `${colors.shadowDark}14` }]}
      >
        <Text className="my-2 text-[11px] font-scdream tracking-[1.5px]" style={{ color: colors.textMuted }}>
          INTAKE ROUTINE
        </Text>
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="my-2 text-[20px] font-scdream-medium" style={{ color: colors.text }}>
              섭취 시간
            </Text>
          </View>
          <View>
            <Pressable
              onPress={() => router.push('/intake-routine-edit' as any)}
              hitSlop={8}
              style={({ pressed }) => [
                neuInset(999, colors.input),
                {
                  paddingHorizontal: 13,
                  paddingVertical: 7,
                  opacity: pressed ? 0.88 : 1,
                  borderWidth: 1,
                  borderColor: `${colors.shadowDark}30`,
                },
              ]}
            >
              <Text className="text-[13px] font-scdream-medium" style={{ color: colors.text }}>
                수정
              </Text>
            </Pressable>
          </View>
        </View>
        <Text className="mb-4 text-[12px] font-scdream" style={{ color: colors.textMuted }}>
          {isLoading ? '불러오는 중…' : `설정된 시간 ${totalCount}개`}
        </Text>

        <View
          className="-mx-5 flex-row items-center justify-between px-10 py-2.5"
          style={{
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: `${colors.shadowDark}1F`,
            backgroundColor: `${colors.input}66`,
          }}
        >
          <Text className="text-[11px] font-scdream tracking-wide" style={{ color: colors.textMuted }}>
            섭취 구분
          </Text>
          <Text className="text-[11px] font-scdream tracking-wide" style={{ color: colors.textMuted }}>
            섭취 시간
          </Text>
        </View>

        {isLoading && (
          <View className="py-7">
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {isError && (
          <View className="items-center py-7">
            <Text className="text-[13px] font-scdream" style={{ color: colors.textMuted }}>
              데이터 로드 실패
            </Text>
          </View>
        )}

        {!isLoading && !isError && routineTimes && routineTimes.length === 0 && (
          <View className="items-center py-7">
            <Text className="text-[13px] font-scdream" style={{ color: colors.textMuted }}>
              설정된 루틴이 없습니다.
            </Text>
          </View>
        )}

        {!isLoading &&
          !isError &&
          routineTimes?.map((t, index) => (
            <View
              key={t.userIntakeTimingSettingId}
              className="flex-row items-center justify-between px-5 py-4"
              style={{
                borderBottomWidth: index === routineTimes.length - 1 ? 0 : 1,
                borderBottomColor: `${colors.shadowDark}1E`,
              }}
            >
              <Text className="text-[13px] font-scdream" style={{ color: colors.textMuted }}>
                {t.intakeTiming}
              </Text>
              <View className="flex-row items-center">
                <View className="mr-3 h-2 w-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                <Text className="text-[15px] font-scdream-medium tracking-wide" style={{ color: colors.text }}>
                  {t.intakeTime}
                </Text>
              </View>
            </View>
          ))}
      </View>
    </View>
  );
}
