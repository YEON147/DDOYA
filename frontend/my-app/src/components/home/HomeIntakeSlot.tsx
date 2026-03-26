import { View, Text, Pressable, Image } from 'react-native';
import { Camera } from 'lucide-react-native';
import { colors } from '@/constants/theme/colors';
import { AppIcon } from '@/src/components/common/AppIcon';
import type { DailyIntakeScheduleSlotItem } from '@/src/types/intakeRoutine';

export type HomeIntakeSlotProps = {
  timeLabel: string;
  items: DailyIntakeScheduleSlotItem[];
  onPressCamera?: (scheduleIds: number[]) => void;
};

/** 홈 — 시간대별 섭취 인증 카드 (Soft Wellness) */
export function HomeIntakeSlot({ timeLabel, items, onPressCamera }: HomeIntakeSlotProps) {
  const scheduleIds = items.map((i) => i.scheduleId);
  const hasItems = items.length > 0;
  const completedCount = items.filter((i) => i.status === 'TAKEN' || i.status === 'SKIPPED').length;
  const remainingCount = Math.max(0, items.length - completedCount);
  const isSlotCompleted = hasItems && remainingCount === 0;
  const success = '#2FB58A';
  const successBg = `${success}12`;
  const successBorder = `${success}33`;
  const STAMP_IMAGE = require('../../../assets/images/DDOYA_stamp.png');

  // 말풍선 사이즈
  const BUBBLE_PAD = 'px-6 py-5';
  const BUBBLE_RADIUS = 'rounded-3xl';
  const TAIL_SIZE = 12;
  const TAIL_OFFSET = 18;

  return (
    <View className="w-full">
      <View className="w-full">
        <View className="w-full">
          <View
            className={`relative ${BUBBLE_RADIUS} ${BUBBLE_PAD}`}
            style={{ backgroundColor: colors.cardIvory, borderWidth: 1, borderColor: `${colors.shadowDark}80` }}
          >
            {isSlotCompleted ? (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: [{ translateX: -56 }, { translateY: -56 }],
                  zIndex: 50,
                  opacity: 0.92,
                }}
              >
                <Image source={STAMP_IMAGE} style={{ width: 150, height: 150 }} resizeMode="contain" />
              </View>
            ) : null}

            <View
              style={{
                position: 'absolute',
                left: -6,
                bottom: TAIL_OFFSET,
                width: TAIL_SIZE,
                height: TAIL_SIZE,
                backgroundColor: colors.cardIvory,
                borderLeftWidth: 1,
                borderBottomWidth: 1,
                borderColor: `${colors.shadowDark}80`,
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
                      disabled={!hasItems}
                      onPress={() => onPressCamera?.(scheduleIds)}
                      hitSlop={10}
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={({ pressed }) => ({
                        opacity: !hasItems ? 0.42 : pressed ? 0.86 : 1,
                        backgroundColor: `${colors.primary}14`,
                        borderWidth: 1,
                        borderColor: `${colors.primary}33`,
                        shadowColor: colors.shadowDark,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 6,
                        elevation: 1,
                      })}
                    >
                      <AppIcon icon={Camera} size={20} color={colors.primary} strokeWidth={1.9} />
                    </Pressable>
                  )}
                </View>
              </View>
              <Text className="mt-1 p-1 text-[14px] font-scdream" style={{ color: colors.textMuted }}>
                {!hasItems
                  ? '이 시간대엔 등록된 영양제가 없어요.'
                  : isSlotCompleted
                    ? '이 시간대 섭취를 완료했어요'
                    : '사진으로 섭취 인증을 해주세요'}
              </Text>
            </View>

            {hasItems ? (
              <View className="mt-3">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-[13px] font-scdream-medium tracking-wide" style={{ color: colors.textMuted }}>
                    섭취할 영양제
                  </Text>
                  <Text className="text-[13px] font-scdream" style={{ color: colors.textMuted }}>
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
                        const badgeBg = isTaken ? successBg : isSkipped ? `${colors.shadowDark}10` : `${colors.input}AA`;
                        const badgeBorder = isTaken ? successBorder : `${colors.shadowDark}22`;
                        const badgeText = isTaken ? success : colors.textMuted;

                        return (
                          <View
                            key={`${it.intakeRecordId ?? it.scheduleId}-${idx}`}
                            className="flex-row items-center rounded-full px-3 py-1.5"
                            style={{ backgroundColor: badgeBg, borderWidth: 1, borderColor: badgeBorder }}
                          >
                            <Text
                              className="text-[13px] font-scdream-medium"
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
