import { useState, useEffect, useMemo } from 'react';
import { View, Text } from 'react-native';
import { colors } from '@/constants/theme/colors';
import { softWellnessCard } from '@/constants/theme/neumorphism';
import type { DailyIntakeTimeSlot } from '@/src/types/intakeRoutine';
import {
  findNextAttentionSlot,
  formatCountdownTimer,
  formatKoreanTime,
  slotTargetDate,
} from '@/src/utils/nextIntake';

type Props = {
  timeSlots: DailyIntakeTimeSlot[];
  isPending: boolean;
  isError: boolean;
  className?: string;
};

const lineColor = `${colors.shadowDark}33`;

/** 홈 — 오늘 루틴 요약 박스 (2행 + 구분선, 와이어 이미지와 동일 구조) */
export function TodayRoutineHeroCard({ timeSlots, isPending, isError, className = '' }: Props) {
  const slotCount = timeSlots.length;
  const nextSlot = useMemo(() => findNextAttentionSlot(timeSlots), [timeSlots]);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const nextTarget = useMemo(() => (nextSlot ? slotTargetDate(nextSlot) : null), [nextSlot]);

  const timerLine = useMemo(() => {
    if (isPending) return '…';
    if (isError) return '—';
    if (slotCount === 0) return '일정 없음';
    if (!nextSlot) return '모두 완료';
    if (!nextTarget) return '--:--:--';
    return formatCountdownTimer(nextTarget, now);
  }, [isPending, isError, slotCount, nextSlot, nextTarget, now]);

  const scheduledTimeLine = useMemo(() => {
    if (isPending || isError || slotCount === 0 || !nextSlot) return null;
    return formatKoreanTime(nextSlot.intakeTime);
  }, [isPending, isError, slotCount, nextSlot]);

  const showTimerStyle =
    !isPending && !isError && slotCount > 0 && nextSlot && nextTarget;

  const topRight = isPending ? '…' : `${slotCount}회`;

  return (
    <View className={className} style={softWellnessCard(20)}>
      <View className="px-4 py-4">
        {/* 1행: 오늘 루틴 | N회 */}
        <View className="flex-row items-center justify-between">
          <Text className="text-[13px] font-scdream" style={{ color: colors.textMuted }}>
            오늘 루틴
          </Text>
          <Text className="text-[13px] font-scdream-medium" style={{ color: colors.textMuted }}>
            {topRight}
          </Text>
        </View>

        <View className="my-3" style={{ borderTopWidth: 1, borderColor: lineColor }} />

        {/* 2행: 다음 섭취 | 타이머 + 예정 시각 */}
        <View className="flex-row items-start justify-between">
          <Text className="text-[13px] font-scdream" style={{ color: colors.textMuted }}>
            다음 섭취
          </Text>
          <View className="max-w-[68%] items-end">
            <Text
              className="text-[22px] font-scdream-bold"
              style={{ color: showTimerStyle ? colors.text : colors.textMuted }}
              numberOfLines={1}
            >
              {timerLine}
            </Text>
            {scheduledTimeLine ? (
              <Text className="mt-1 text-[12px] font-scdream" style={{ color: colors.textMuted }}>
                {scheduledTimeLine}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
