import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { NicknameHeader } from '@/src/components/common/HeaderMessage';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TodayRoutineHeroCard } from '@/src/components/common/TodayRoutineHeroCard';
import { HomeIntakeSlot } from '@/src/components/home/HomeIntakeSlot';
import { colors } from '@/constants/theme/colors';
import { neuInset, neuRaised } from '@/constants/theme/neumorphism';
import { AppIcon } from '@/src/components/common/AppIcon';
import { useDailyIntakeSchedule } from '@/hooks/useIntakeRoutine';
import { formatKoreanTime } from '@/src/utils/nextIntake';

export default function HomeScreen() {
  const router = useRouter();
  const unreadCount = 3;
  const { data: schedule, isPending, isError, refetch, isRefetching } = useDailyIntakeSchedule();
  const timeSlots = schedule?.timeSlots ?? [];
  const slotCount = timeSlots.length;

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

          <Text className="mt-6 text-[13px] font-scdream-medium" style={{ color: colors.text }}>
            시간대별 섭취 루틴
          </Text>

          <View className="mt-3 gap-5">
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
              onPressCamera={() => router.push('/intake-verify' as never)}
            />
          ))
        )}
          </View>
        </View>
    </ScreenContainer>
  );
}
