import { View, Text, Pressable, Image, useWindowDimensions } from 'react-native';
import { Camera } from 'lucide-react-native';
import { colors } from '@/constants/theme/colors';
import { AppIcon } from '@/src/components/common/AppIcon';
import type { DailyIntakeScheduleSlotItem } from '@/src/types/intakeRoutine';
import { scaleByWidth } from '@/src/utils/responsive';
import { slotFailDeadline } from '@/src/utils/nextIntake';

export type HomeIntakeSlotProps = {
  timeLabel: string;
  intakeTime: string;
  plannedAt?: string;
  now: Date;
  items: DailyIntakeScheduleSlotItem[];
  onPressCamera?: (scheduleIds: number[]) => void;
};

/** 홈 — 시간대별 섭취 인증 카드 (Soft Wellness) */
export function HomeIntakeSlot({ timeLabel, intakeTime, plannedAt, now, items, onPressCamera }: HomeIntakeSlotProps) {
  const { width } = useWindowDimensions();
  const scheduleIds = items.map((i) => i.scheduleId);
  const hasItems = items.length > 0;
  const completedCount = items.filter((i) => i.status === 'TAKEN' || i.status === 'SKIPPED' || i.status === 'MISSED').length;
  const pendingCount = Math.max(0, items.length - completedCount);
  const pseudoSlot = { intakeTime, plannedAt: plannedAt ?? '', items };
  const deadline = slotFailDeadline(pseudoSlot);
  const isTimedOut = hasItems && pendingCount > 0 && !!deadline && now.getTime() >= deadline.getTime();
  const hasMissed = items.some((i) => i.status === 'MISSED');
  const isFailedSlot = isTimedOut || hasMissed;
  const remainingCount = isTimedOut ? 0 : pendingCount;
  const isSlotCompleted = hasItems && remainingCount === 0;
  const success = '#2FB58A';
  const successBg = `${success}12`;
  const successBorder = `${success}33`;
  const STAMP_IMAGE = require('../../../assets/images/DDOYA_stamp.png');
  const FAIL_STAMP_IMAGE = require('../../../assets/images/fail.png');
  const bubblePaddingH = scaleByWidth(width, 22, { min: 16, max: 24 });
  const bubblePaddingV = scaleByWidth(width, 18, { min: 14, max: 22 });
  const BUBBLE_RADIUS = 'rounded-3xl';
  const tailSize = scaleByWidth(width, 12, { min: 10, max: 14 });
  const tailOffset = scaleByWidth(width, 18, { min: 14, max: 24 });
  const stampSize = scaleByWidth(width, 150, { min: 112, max: 182 });

  return (
    <View className="w-full">
      <View className="w-full">
        <View className="w-full">
          <View
            className={`relative ${BUBBLE_RADIUS}`}
            style={{
              backgroundColor: colors.cardIvory,
              borderWidth: 1,
              borderColor: `${colors.shadowDark}22`,
              paddingHorizontal: bubblePaddingH,
              paddingVertical: bubblePaddingV,
            }}
          >
            {isSlotCompleted ? (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: [
                    { translateX: -(stampSize / 2) + scaleByWidth(width, 26, { min: 18, max: 34 }) },
                    { translateY: -(stampSize / 2) + scaleByWidth(width, 18, { min: 12, max: 26 }) },
                  ],
                  zIndex: 50,
                  opacity: 0.88,
                }}
              >
                <Image
                  source={isFailedSlot ? FAIL_STAMP_IMAGE : STAMP_IMAGE}
                  style={{ width: stampSize, height: stampSize, alignSelf: 'center' }}
                  resizeMode="contain"
                />
              </View>
            ) : null}

            <View
              style={{
                position: 'absolute',
                left: -6,
                bottom: tailOffset,
                width: tailSize,
                height: tailSize,
                backgroundColor: colors.cardIvory,
                borderLeftWidth: 1,
                borderBottomWidth: 1,
                borderColor: `${colors.shadowDark}22`,
                transform: [{ rotate: '45deg' }],
              }}
            />

            <View>
              <View className="flex-row items-center justify-between p-1">
                <View className="flex-row items-center pr-3">
                  <View className="mr-3 h-2 w-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                  <Text className="text-[18px] font-scdream-bold" style={{ color: colors.text }} numberOfLines={1}>
                    {timeLabel}
                  </Text>
                </View>

                {/* 우측 영역 폭 고정 (완료/카메라 전환 시 레이아웃 흔들림 방지) */}
                <View className="h-10 w-10 items-center justify-center">
                  {isSlotCompleted ? (
                    <View />
                  ) : (
                    <Pressable
                      disabled={!hasItems || isFailedSlot}
                      onPress={() => onPressCamera?.(scheduleIds)}
                      hitSlop={10}
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={({ pressed }) => ({
                        opacity: !hasItems || isFailedSlot ? 0.42 : pressed ? 0.86 : 1,
                        backgroundColor: `${colors.primary}0F`,
                        borderWidth: 1,
                        borderColor: `${colors.shadowDark}18`,
                      })}
                    >
                      <AppIcon icon={Camera} size={20} color={colors.primary} strokeWidth={2.2} />
                    </Pressable>
                  )}
                </View>
              </View>
              <Text className="mt-1 p-1 text-base font-scdream" style={{ color: colors.textMuted }}>
                {!hasItems
                  ? '이 시간대엔 등록된 영양제가 없어요.'
                  : isSlotCompleted
                    ? isFailedSlot
                      ? '섭취 가능 시간이 지나 실패 처리됐어요'
                      : '이 시간대 섭취를 완료했어요'
                    : '사진으로 섭취 인증을 해주세요'}
              </Text>
            </View>

            {hasItems ? (
              <View className="mt-3">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-sm font-scdream-medium tracking-wide" style={{ color: colors.textMuted }}>
                    섭취할 영양제
                  </Text>
                  <Text className="text-sm font-scdream" style={{ color: colors.textMuted }}>
                    남은 {remainingCount} · 완료 {completedCount}
                  </Text>
                </View>

                <View
                  className="overflow-hidden rounded-2xl"
                  style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: `${colors.shadowDark}18` }}
                >
                  <View style={{ height: 3, backgroundColor: `${success}26` }} />
                  <View className="p-3">
                    <View className="flex-row flex-wrap gap-2">
                      {items.map((it, idx) => {
                        const isTaken = it.status === 'TAKEN';
                        const isSkipped = it.status === 'SKIPPED';
                        const isMissed = it.status === 'MISSED';
                        const missed = '#D95F5F';
                        const badgeBg = isTaken
                          ? successBg
                          : isMissed
                            ? `${missed}12`
                            : isSkipped
                              ? `${colors.shadowDark}10`
                              : `${colors.input}AA`;
                        const badgeBorder = isTaken ? successBorder : isMissed ? `${missed}40` : `${colors.shadowDark}22`;
                        const badgeText = isTaken ? success : isMissed ? missed : colors.textMuted;

                        return (
                          <View
                            key={`${it.intakeRecordId ?? it.scheduleId}-${idx}`}
                            className="flex-row items-center rounded-full px-3 py-1.5"
                            style={{ backgroundColor: badgeBg, borderWidth: 1, borderColor: badgeBorder }}
                          >
                            <Text
                              className="text-sm font-scdream-medium"
                              style={{ color: badgeText }}
                              numberOfLines={1}
                            >
                              {it.alias}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
