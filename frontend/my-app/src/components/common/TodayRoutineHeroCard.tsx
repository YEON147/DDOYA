import { useState, useEffect, useMemo } from 'react';
import { View, Text, Image } from 'react-native';
import { colors } from '@/constants/theme/colors';
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

const CHARACTER_IMAGE = require('../../../assets/images/character.png');

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

  const speechTitle = useMemo(() => {
    if (isPending) return '오늘 루틴 불러오는 중…';
    if (isError) return '오늘 루틴을 불러오지 못했어요';
    if (slotCount === 0) return '오늘은 등록된 섭취 일정이 없어요';
    if (!nextSlot) return '오늘 루틴, 전부 완료했어요';
    return '오늘도 루틴 체크해볼까요?';
  }, [isPending, isError, slotCount, nextSlot]);

  const speechBody = useMemo(() => {
    if (isPending) return '잠시만 기다려줘요.';
    if (isError) return '잠깐만요… 잠시 후 다시 시도해 주세요.';
    if (slotCount === 0) return '루틴을 추가하면 여기서 바로 확인할 수 있어요.';
    if (!nextSlot) return '완벽해요! 오늘은 여기까지.';
    if (!nextTarget) return '다음 섭취 시간을 확인해 주세요.';
    // 정상 상태 메시지는 UI에서 타이머 중심으로 조합
    return '';
  }, [isPending, isError, slotCount, nextSlot, nextTarget, scheduledTimeLine, topRight, timerLine]);

  return (
    <View className={className}>
      <View className="flex-row items-stretch">
          {/* 말풍선 */}
          <View className="flex-1 mr-6" style={{ maxWidth: 340 }}>
            <View
              className="relative rounded-3xl p-5"
              style={{
                backgroundColor: colors.cardIvory,
                borderWidth: 1,
                borderColor: `${colors.shadowDark}80`,
              }}
            >
              {/* 꼬리 */}
              <View
                style={{
                  position: 'absolute',
                  right: -6,
                  bottom: 18,
                  width: 12,
                  height: 12,
                  backgroundColor: colors.cardIvory,
                  borderRightWidth: 1,
                  borderTopWidth: 1,
                  borderColor: `${colors.shadowDark}80`,
                  transform: [{ rotate: '45deg' }],
                }}
              />

              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text
                    className="text-[15px] font-scdream-medium p-2"
                    style={{ color: colors.text, letterSpacing: -0.2 }}
                  >
                    {speechTitle}
                  </Text>
                  <View className="mt-1.5 p-2">
                    {showTimerStyle ? (
                      <View>
                        <Text className="text-[12px] font-scdream" style={{ color: colors.textMuted }}>
                          다음 섭취까지{' '}
                          <Text className="font-scdream-bold" style={{ color: colors.text }}>
                            {timerLine}
                          </Text>
                          {' '}남았어요
                        </Text>
                        {scheduledTimeLine ? (
                          <Text className="mt-1 text-[11px] font-scdream" style={{ color: colors.textMuted }}>
                            예정 시각 · {scheduledTimeLine}
                          </Text>
                        ) : null}
                      </View>
                    ) : (
                      <Text className="text-[12px] font-scdream leading-5" style={{ color: colors.textMuted }}>
                        {speechBody}
                      </Text>
                    )}
                  </View>
                </View>

                {/* 우측 요약 박스 제거 (중복 정보 방지) */}
              </View>
            </View>
          </View>

          {/* 캐릭터 */}
          <View className="w-[90px] items-center justify-end mt-10">
            <Image
              source={CHARACTER_IMAGE}
              style={{ width: 96, height: 132 }}
              resizeMode="contain"
            />
          </View>
      </View>
    </View>
  );
}
