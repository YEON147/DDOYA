import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { NicknameHeader } from '@/src/components/common/HeaderMessage';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { HomeIntakeSlot } from '@/src/components/home/HomeIntakeSlot';
import { colors } from '@/constants/theme/colors';
import { neuInset, neuRaised } from '@/constants/theme/neumorphism';
import { AppIcon } from '@/src/components/common/AppIcon';
import { useDailyIntakeSchedule } from '@/hooks/useIntakeRoutine';
import type { DailyIntakeTimeSlot } from '@/src/types/intakeRoutine';

function formatKoreanTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const isPm = h >= 12;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const period = isPm ? '오후' : '오전';
  return `${period} ${h12}:${m.toString().padStart(2, '0')}`;
}

function nextIntakeSummary(slots: DailyIntakeTimeSlot[]): string {
  const needsAttention = (s: DailyIntakeTimeSlot) =>
    s.items.some((i) => i.status !== 'TAKEN' && i.status !== 'SKIPPED');
  const next = slots.find(needsAttention);
  if (!next) return '오늘 일정을 모두 마쳤어요';
  return `다음 섭취 ${formatKoreanTime(next.intakeTime)}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const unreadCount = 3;
  const { data: schedule, isPending, isError, refetch, isRefetching } = useDailyIntakeSchedule();
  const timeSlots = schedule?.timeSlots ?? [];
  const slotCount = timeSlots.length;

  return (
    <ScreenContainer>
      <View className="relative">
        <NicknameHeader message="잊지말고 섭취 인증을 해주세요!" messageTone="subtle" />
        <Pressable
          onPress={() => router.push('/notifications' as never)}
          hitSlop={10}
          className="absolute right-2 top-3 h-10 w-10 items-center justify-center rounded-full"
          style={({ pressed }) => [neuRaised(999, colors.surface), { opacity: pressed ? 0.82 : 1 }]}
        >
          <AppIcon icon={Bell} size={19} color={colors.text} />
          {unreadCount > 0 && (
            <View
              className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full px-1 py-[1px] items-center"
              style={{ backgroundColor: '#EF4444' }}
            >
              <Text className="text-[10px] font-scdream-medium text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <View className="mt-1 rounded-2xl px-4 py-3" style={neuInset(18, colors.surface)}>
        <View className="flex-row items-center justify-between">
          <Text className="text-[12px] font-scdream" style={{ color: colors.textMuted }}>
            오늘 루틴
          </Text>
          <Text className="text-[12px] font-scdream-medium" style={{ color: colors.text }}>
            {isPending ? '…' : `${slotCount}회`}
          </Text>
        </View>
        <View
          className="mt-2.5 flex-row items-center justify-between border-t pt-2.5"
          style={{ borderColor: `${colors.shadowDark}44` }}
        >
          <Text className="text-[12px] font-scdream" style={{ color: colors.textMuted }}>
            다음 섭취
          </Text>
          <Text className="text-[12px] font-scdream-medium" style={{ color: colors.text }}>
            {isPending ? '불러오는 중…' : isError ? '일정을 불러오지 못했어요' : nextIntakeSummary(timeSlots)}
          </Text>
        </View>
      </View>

      <View className="mt-4 px-1">
        <Text className="text-[13px] font-scdream-medium" style={{ color: colors.text }}>
          시간대별 섭취 루틴
        </Text>
      </View>

      <View className="mt-4 gap-4">
        {isPending ? (
          <View className="items-center py-10">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : isError ? (
          <Pressable
            onPress={() => refetch()}
            className="rounded-2xl px-4 py-6"
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
    </ScreenContainer>
  );
}
