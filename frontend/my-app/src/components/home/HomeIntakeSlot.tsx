import { View, Text, Pressable, Image } from 'react-native';
import { Camera, Check } from 'lucide-react-native';
import { colors } from '@/constants/theme/colors';
import { softWellnessCard } from '@/constants/theme/neumorphism';
import { AppIcon } from '@/src/components/common/AppIcon';
import type { DailyIntakeScheduleSlotItem } from '@/src/types/intakeRoutine';
import { getBodyPartImageSource } from '@/constants/bodyPartImages';

export type HomeIntakeSlotProps = {
  timeLabel: string;
  items: DailyIntakeScheduleSlotItem[];
  onPressCamera?: (scheduleIds: number[]) => void;
};

/** MISSED도 강한 빨강 대신 낮은 대비 톤으로 통일 */
function statusStyle(status: DailyIntakeScheduleSlotItem['status']) {
  switch (status) {
    case 'TAKEN':
      return {
        track: `${colors.primary}4D`,
        showCheck: true,
        captionBg: `${colors.primary}18`,
      };
    case 'MISSED':
      return {
        track: `${colors.textMuted}33`,
        showCheck: false,
        captionBg: `${colors.shadowDark}10`,
      };
    case 'SKIPPED':
    default:
      return {
        track: `${colors.shadowDark}2E`,
        showCheck: false,
        captionBg: `${colors.shadowLight}CC`,
      };
  }
}

/** 홈 — 시간대별 섭취 인증 카드 (Soft Wellness) */
export function HomeIntakeSlot({ timeLabel, items, onPressCamera }: HomeIntakeSlotProps) {
  return (
    <View>
      <View className="px-4 py-4" style={softWellnessCard(20)}>
        <View className="mb-3 flex-row items-center justify-between">
          <View className="min-w-0 flex-1 flex-row items-center">
            <View
              className="mr-2 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
            <View
              className="rounded-full px-2.5 py-1"
              style={{
                backgroundColor: colors.input,
                borderWidth: 1,
                borderColor: `${colors.shadowDark}28`,
              }}
            >
              <Text className="text-[11px] font-scdream" style={{ color: colors.textMuted }}>
                섭취 시간
              </Text>
            </View>
            <Text
              className="ml-2 text-[17px] font-scdream-medium"
              style={{ color: colors.text }}
              numberOfLines={1}
            >
              {timeLabel}
            </Text>
          </View>
          <Pressable
            onPress={() => onPressCamera?.(items.map((item) => item.scheduleId))}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={({ pressed }) => ({
              backgroundColor: colors.input,
              borderWidth: 1,
              borderColor: `${colors.shadowDark}30`,
              opacity: pressed ? 0.82 : 1,
            })}
          >
            <AppIcon icon={Camera} size={16} color={colors.iconMuted} strokeWidth={1.75} />
          </Pressable>
        </View>

        <View className="flex-row flex-wrap">
          {items.length === 0 ? (
            <Text className="w-full py-2 text-[12px] font-scdream" style={{ color: colors.textMuted }}>
              이 시간대에 등록된 영양제가 없어요.
            </Text>
          ) : (
            items.map((item, i) => {
              const s = statusStyle(item.status);
              return (
                <View
                  key={item.intakeRecordId ?? `${item.scheduleId}-${i}`}
                  className="mb-3 overflow-hidden rounded-2xl"
                  style={{
                    width: '31.5%',
                    marginRight: (i + 1) % 3 === 0 ? 0 : '2.75%',
                    backgroundColor: colors.cardIvory,
                    borderWidth: 1,
                    borderColor: `${colors.shadowDark}16`,
                  }}
                >
                  <View
                    className="relative w-full items-center justify-center"
                    style={{ aspectRatio: 1, backgroundColor: `${colors.input}66`, padding: 6 }}
                  >
                    <Image
                      source={getBodyPartImageSource(item.bodyPartId)}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                    {s.showCheck ? (
                      <View
                        className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${colors.cardIvory}F0`, borderWidth: 1, borderColor: `${colors.primary}55` }}
                      >
                        <AppIcon icon={Check} size={16} color={colors.primary} strokeWidth={2.2} />
                      </View>
                    ) : null}
                  </View>
                  <View
                    className="px-2.5 pb-2.5 pt-2"
                    style={{ backgroundColor: s.captionBg, borderTopWidth: 1, borderTopColor: `${colors.shadowDark}14` }}
                  >
                    <Text
                      className="text-[13px] font-scdream-medium leading-snug"
                      style={{ color: colors.text }}
                      numberOfLines={2}
                    >
                      {item.alias}
                    </Text>
                    <Text className="mt-1 text-[11px] font-scdream" style={{ color: colors.textMuted }}>
                      1회 {item.dosePerIntake}정 섭취
                    </Text>
                  </View>
                  <View className="h-[3px]" style={{ backgroundColor: s.track }} />
                </View>
              );
            })
          )}
        </View>
      </View>
    </View>
  );
}
