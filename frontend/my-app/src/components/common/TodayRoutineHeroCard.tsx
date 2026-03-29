import { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, useWindowDimensions } from 'react-native';
import { colors } from '@/constants/theme/colors';
import type { DailyIntakeTimeSlot } from '@/src/types/intakeRoutine';
import { useAuthStore } from '@/src/store/authStore';
import { scaleByWidth } from '@/src/utils/responsive';
import {
  findNextUpcomingSlot,
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
  const { width } = useWindowDimensions();
  const bubbleBg = `${colors.cardIvory}CC`;
  const slotCount = timeSlots.length;
  const nickname = useAuthStore((s) => s.nickname);
  const bubbleHeight = scaleByWidth(width, 148, { min: 140, max: 170 });

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const nextSlot = useMemo(() => findNextUpcomingSlot(timeSlots, now), [timeSlots, now]);
  const nextTarget = useMemo(() => (nextSlot ? slotTargetDate(nextSlot) : null), [nextSlot]);

  const timerLine = useMemo(() => {
    if (isPending) return '…';
    if (isError) return '—';
    if (slotCount === 0) return '일정 없음';
    if (!nextSlot) return '오늘 일정 종료';
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
    if (slotCount === 0) return '등록된 섭취 일정이 없어요';
    if (!nextSlot) return '오늘 섭취 루틴이 끝났어요';
    return '오늘도 루틴 체크해볼까요?';
  }, [isPending, isError, slotCount, nextSlot]);

  const speechBody = useMemo(() => {
    if (isPending) return '잠시만 기다려줘요.';
    if (isError) return '잠깐만요… 잠시 후 다시 시도해 주세요.';
    if (slotCount === 0) return '루틴을 추가하면 여기서 바로  확인할 수 있어요 !';
    if (!nextSlot) return '우리 내일 또봐요 !!';
    if (!nextTarget) return '다음 섭취 시간을 확인해 주세요.';
    // 정상 상태 메시지는 UI에서 타이머 중심으로 조합
    return '';
  }, [isPending, isError, slotCount, nextSlot, nextTarget, scheduledTimeLine, topRight, timerLine]);

  return (
    <View className={className}>
      <View className="flex-row items-stretch">
          {/* 말풍선 */}
          <View
            className="flex-1"
            style={{
              marginRight: scaleByWidth(width, 24, { min: 14, max: 28 }),
              maxWidth: scaleByWidth(width, 340, { min: 300, max: 420 }),
            }}
          >
            <View
              className="relative rounded-3xl"
              style={{
                backgroundColor: bubbleBg,
                borderWidth: 1,
                borderColor: `${colors.shadowDark}22`,
                paddingHorizontal: scaleByWidth(width, 18, { min: 14, max: 22 }),
                paddingVertical: scaleByWidth(width, 16, { min: 14, max: 22 }),
                height: bubbleHeight,
                shadowColor: colors.shadowDark,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {/* 은은한 컬러 레이어 (그라데이션 느낌) */}
              <View
                pointerEvents="none"
                style={{
                  zIndex: 0,
                  position: 'absolute',
                  top: -scaleByWidth(width, 18, { min: 14, max: 24 }),
                  right: -scaleByWidth(width, 22, { min: 16, max: 28 }),
                  width: scaleByWidth(width, 120, { min: 96, max: 144 }),
                  height: scaleByWidth(width, 120, { min: 96, max: 144 }),
                  borderRadius: 999,
                  backgroundColor: `${colors.primary}12`,
                }}
              />
              <View
                pointerEvents="none"
                style={{
                  zIndex: 0,
                  position: 'absolute',
                  bottom: -scaleByWidth(width, 22, { min: 16, max: 28 }),
                  left: -scaleByWidth(width, 18, { min: 14, max: 24 }),
                  width: scaleByWidth(width, 110, { min: 88, max: 136 }),
                  height: scaleByWidth(width, 110, { min: 88, max: 136 }),
                  borderRadius: 999,
                  backgroundColor: `${colors.brown}0C`,
                }}
              />

              {/* 꼬리 */}
              <View
                style={{
                  zIndex: 0,
                  position: 'absolute',
                  right: -scaleByWidth(width, 6, { min: 5, max: 8 }),
                  bottom: scaleByWidth(width, 18, { min: 14, max: 24 }),
                  width: scaleByWidth(width, 12, { min: 10, max: 14 }),
                  height: scaleByWidth(width, 12, { min: 10, max: 14 }),
                  backgroundColor: bubbleBg,
                  borderRightWidth: 1,
                  borderTopWidth: 1,
                  borderColor: `${colors.shadowDark}22`,
                  transform: [{ rotate: '45deg' }],
                }}
              />

              <View className="flex-1 flex-row items-start justify-between gap-3" style={{ zIndex: 1 }}>
                <View className="min-h-0 flex-1">
                  <View className="px-1">
                    <Text
                      className="text-[16px] font-scdream-regular"
                      style={{ color: colors.text, letterSpacing: -0.2, lineHeight: 22 }}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {(nickname ?? '회원') + '님, 오셨군요.'}
                    </Text>
                    <Text
                      className="mt-1.5 text-[16px] font-scdream-regular"
                      style={{ color: colors.text, letterSpacing: -0.2, lineHeight: 22 }}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {speechTitle}
                    </Text>
                    <View
                      className="mt-1.5"
                      style={{ height: 1, backgroundColor: `${colors.shadowDark}22` }}
                    />
                  </View>
                  <View className="mt-2 px-1">
                    {showTimerStyle ? (
                      <View className="py-0.5">
                        <Text
                          className="text-base font-scdream"
                          style={{ color: colors.textMuted, lineHeight: 20 }}
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          다음 복용까지 남은 시간
                        </Text>
                        <Text
                          className="mt-0.5 text-[20px] font-scdream-bold tracking-tight"
                          style={{ color: colors.text, lineHeight: 24 }}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          adjustsFontSizeToFit
                          minimumFontScale={0.75}
                        >
                          {timerLine}
                        </Text>
                      </View>
                    ) : (
                      <Text
                        className="text-base font-scdream"
                        style={{ color: colors.textMuted, lineHeight: 20 }}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                      >
                        {speechBody}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 캐릭터 */}
          <View
            className="items-center justify-end"
            style={{
              width: scaleByWidth(width, 90, { min: 76, max: 110 }),
              marginTop: scaleByWidth(width, 40, { min: 24, max: 50 }),
            }}
          >
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                bottom: -scaleByWidth(width, 8, { min: 6, max: 12 }),
                right: -scaleByWidth(width, 4, { min: 2, max: 8 }),
                width: scaleByWidth(width, 54, { min: 42, max: 62 }),
                height: scaleByWidth(width, 54, { min: 42, max: 62 }),
                borderRadius: 999,
                backgroundColor: `${colors.primary}14`,
              }}
            />
            <Image
              source={CHARACTER_IMAGE}
              style={{
                width: scaleByWidth(width, 96, { min: 82, max: 120 }),
                height: scaleByWidth(width, 132, { min: 112, max: 158 }),
              }}
              resizeMode="contain"
            />
          </View>
      </View>
    </View>
  );
}
