import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { NicknameHeader } from '@/src/components/common/HeaderMessage';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TodayRoutineHeroCard } from '@/src/components/common/TodayRoutineHeroCard';
import { HomeIntakeSlot } from '@/src/components/home/HomeIntakeSlot';
import { colors } from '@/constants/theme/colors';
import { neuInset, neuRaised, softWellnessCard } from '@/constants/theme/neumorphism';
import { AppIcon } from '@/src/components/common/AppIcon';
import { useDailyIntakeSchedule } from '@/hooks/useIntakeRoutine';
import { formatKoreanTime, formatKoreanTodayParts } from '@/src/utils/nextIntake';

export default function HomeScreen() {
  const router = useRouter();
  const unreadCount = 3;
  const { data: schedule, isPending, isError, refetch, isRefetching } = useDailyIntakeSchedule();
  const timeSlots = schedule?.timeSlots ?? [];
  const slotCount = timeSlots.length;
  const { monthDay, weekday } = formatKoreanTodayParts();

  return (
    <ScreenContainer
      contentContainerStyle={{
        paddingHorizontal: 0,
        paddingTop: 18,
        paddingBottom: 32,
      }}
    >
        <View className="px-[18px]">
          <View className="relative">
            <NicknameHeader
              message="잊지말고 섭취 인증을 해주세요!"
              messageTone="subtle"
            />
            <Pressable
              onPress={() => router.push('/notifications' as never)}
              hitSlop={10}
              className="absolute right-2 top-3 h-10 w-10 items-center justify-center rounded-full"
              style={({ pressed }) => [neuRaised(999, colors.surface), { opacity: pressed ? 0.82 : 1 }]}
            >
              <AppIcon icon={Bell} size={19} color={colors.iconMuted} strokeWidth={1.75} />
              {unreadCount > 0 && (
                <View
                  className="absolute -right-0.5 -top-0.5 min-w-[18px] items-center rounded-full px-1 py-[1px]"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-[10px] font-scdream-medium text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <TodayRoutineHeroCard
            className="mt-1"
            timeSlots={timeSlots}
            isPending={isPending}
            isError={isError}
          />

          <View
            className="mt-6 flex-row overflow-hidden"
            style={[softWellnessCard(18), { alignItems: 'stretch' }]}
          >
            <View style={{ width: 4, backgroundColor: colors.primary }} />
            <View className="flex-1 flex-row items-center justify-between py-3.5 pl-3 pr-4">
              <Text
                className="font-scdream-medium ml-2"
                style={{ color: colors.text, fontSize: 18, letterSpacing: -0.4 }}
              >
                {monthDay}
              </Text>
              <View
                className="rounded-full px-3 py-1.5"
                style={{
                  backgroundColor: `${colors.primary}12`,
                  borderWidth: 1,
                  borderColor: `${colors.primary}33`,
                }}
              >
                <Text className="text-[12px] font-scdream-medium" style={{ color: colors.primary }}>
                  {weekday}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-4 gap-5">
        {isPending ? (
          <View className="items-center py-10">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : isError ? (
          <Pressable
            onPress={() => refetch()}
            className="rounded-[20px] px-4 py-6"
            style={neuInset(14, colors.surface)}
          >
            <Text className="text-center text-[13px] font-scdream" style={{ color: colors.textMuted }}>
              일별 스케줄을 불러오지 못했습니다. 탭하여 다시 시도
            </Text>
            {isRefetching && (
              <ActivityIndicator className="mt-3" color={colors.primary} />
            )}
          </Pressable>
        ) : slotCount === 0 ? (
          <Text className="px-1 text-[13px] font-scdream" style={{ color: colors.textMuted }}>
            오늘 등록된 섭취 일정이 없어요.
          </Text>
        ) : (
          timeSlots.map((slot) => (
            <HomeIntakeSlot
              key={slot.plannedAt}
              timeLabel={formatKoreanTime(slot.intakeTime)}
              items={slot.items}
              onPressCamera={(scheduleIds: number[]) =>
                router.push(`/intake-verify?scheduleIds=${encodeURIComponent(scheduleIds.join(','))}` as never)
              }
            />
          ))
        )}
          </View>
        </View>
    </ScreenContainer>
  );
}
