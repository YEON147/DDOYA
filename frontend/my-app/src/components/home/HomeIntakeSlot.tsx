import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Camera } from 'lucide-react-native';
import { colors } from '@/constants/theme/colors';
import { INTAKE_STAMP_FAIL, INTAKE_STAMP_SUCCESS } from '@/src/constants/intakeStampImages';
import { AppIcon } from '@/src/components/common/AppIcon';
import type { DailyIntakeScheduleSlotItem } from '@/src/types/intakeRoutine';
import { scaleByWidth } from '@/src/utils/responsive';

export type HomeIntakeSlotProps = {
  timeLabel: string;
  intakeTime: string;
  items: DailyIntakeScheduleSlotItem[];
  onPressCamera?: (scheduleIds: number[]) => void;
};

/** 홈 — 시간대별 섭취 인증 카드. `TAKEN`만 완료 도장, `SKIPPED`만 실패 도장, `MISSED`는 인증 유도(도장 없음). */
export function HomeIntakeSlot({ timeLabel, intakeTime, items, onPressCamera }: HomeIntakeSlotProps) {
  const { width } = useWindowDimensions();
  const scheduleIds = items.map((i) => i.scheduleId);
  const hasItems = items.length > 0;
  const takenCount = items.filter((i) => i.status === 'TAKEN').length;
  const missedCount = items.filter((i) => i.status === 'MISSED').length;
  const hasSkipped = items.some((i) => i.status === 'SKIPPED');
  const allTaken = hasItems && items.every((i) => i.status === 'TAKEN');
  const showSuccessStamp = allTaken;
  const showFailStamp = hasItems && hasSkipped;
  const showStamp = showSuccessStamp || showFailStamp;
  const needsPhotoVerify = hasItems && !allTaken && !hasSkipped && missedCount > 0;
  const failSlotMessage = '섭취 가능 시간이 지나 실패 처리됐어요';
  const missedPromptMessage = '사진을 찍어 섭취 인증을 해 주세요';
  const success = '#2FB58A';
  const successBg = `${success}12`;
  const successBorder = `${success}33`;
  const bubblePaddingH = scaleByWidth(width, 22, { min: 16, max: 24 });
  const bubblePaddingV = scaleByWidth(width, 18, { min: 14, max: 22 });
  const BUBBLE_RADIUS = 'rounded-3xl';
  const tailSize = scaleByWidth(width, 12, { min: 10, max: 14 });
  const tailOffset = scaleByWidth(width, 18, { min: 14, max: 24 });
  const stampSuccessSize = scaleByWidth(width, 168, { min: 124, max: 198 });
  /** fail.png 여백 보정만 살짝 (성공 대비 과하게 키우지 않음) */
  const stampFailSize = Math.round(stampSuccessSize * 1.05);
  const stampDisplaySize = showFailStamp ? stampFailSize : stampSuccessSize;

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
            {showStamp ? (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: [
                    { translateX: -(stampDisplaySize / 2) + scaleByWidth(width, 26, { min: 18, max: 34 }) },
                    { translateY: -(stampDisplaySize / 2) + scaleByWidth(width, 18, { min: 12, max: 26 }) },
                  ],
                  zIndex: 50,
                  opacity: 0.88,
                }}
              >
                <Image
                  source={showFailStamp ? INTAKE_STAMP_FAIL : INTAKE_STAMP_SUCCESS}
                  style={{ width: stampDisplaySize, height: stampDisplaySize, alignSelf: 'center' }}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  priority="high"
                  transition={null}
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
                  {allTaken || hasSkipped ? (
                    <View />
                  ) : (
                    <Pressable
                      disabled={!hasItems}
                      onPress={() => onPressCamera?.(scheduleIds)}
                      hitSlop={10}
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={({ pressed }) => ({
                        opacity: !hasItems ? 0.42 : pressed ? 0.86 : 1,
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
                  : showSuccessStamp
                    ? '이 시간대 섭취를 완료했어요'
                    : showFailStamp
                      ? failSlotMessage
                      : needsPhotoVerify
                        ? missedPromptMessage
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
                    미인증 {missedCount} · 완료 {takenCount}
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
