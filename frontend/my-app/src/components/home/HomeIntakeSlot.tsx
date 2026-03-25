import { View, Text, Pressable } from 'react-native';
import { Camera, Check } from 'lucide-react-native';
import { colors } from '@/constants/theme/colors';
import { softWellnessCard } from '@/constants/theme/neumorphism';
import { AppIcon } from '@/src/components/common/AppIcon';
import type { DailyIntakeScheduleSlotItem } from '@/src/types/intakeRoutine';

export type HomeIntakeSlotProps = {
  timeLabel: string;
  items: DailyIntakeScheduleSlotItem[];
  onPressCamera?: () => void;
};

/** MISSED도 강한 빨강 대신 낮은 대비 톤으로 통일 */
function statusStyle(status: DailyIntakeScheduleSlotItem['status']) {
  switch (status) {
    case 'TAKEN':
      return {
        bg: `${colors.primary}14`,
        track: `${colors.primary}4D`,
        showCheck: true,
      };
    case 'MISSED':
      return {
        bg: `${colors.shadowDark}12`,
        track: `${colors.textMuted}33`,
        showCheck: false,
      };
    case 'SKIPPED':
    default:
      return {
        bg: `${colors.shadowLight}E6`,
        track: `${colors.shadowDark}2E`,
        showCheck: false,
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
            <View className="mr-2 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: colors.primary }} />
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
            onPress={onPressCamera}
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
                  className="mb-2 rounded-2xl p-1.5"
                  style={{
                    width: '31.5%',
                    aspectRatio: 1,
                    marginRight: (i + 1) % 3 === 0 ? 0 : '2.75%',
                    backgroundColor: `${colors.cardIvory}`,
                    borderWidth: 1,
                    borderColor: `${colors.shadowDark}16`,
                  }}
                >
                  <View
                    className="relative mb-1.5 flex-1 justify-center rounded-xl px-1 py-1"
                    style={{
                      minHeight: 44,
                      backgroundColor: s.bg,
                      borderWidth: 1,
                      borderColor: `${colors.shadowDark}18`,
                    }}
                  >
                    {s.showCheck ? (
                      <View className="absolute right-0.5 top-0.5">
                        <AppIcon icon={Check} size={12} color={colors.primary} strokeWidth={2.2} />
                      </View>
                    ) : null}
                    <Text
                      className="pr-3 text-[10px] font-scdream-medium leading-tight"
                      style={{ color: colors.text }}
                      numberOfLines={3}
                    >
                      {item.alias}
                    </Text>
                    <Text className="mt-0.5 text-[9px] font-scdream" style={{ color: colors.textMuted }}>
                      {item.dosePerIntake}정
                    </Text>
                  </View>
                  <View className="h-[3px] rounded-full" style={{ backgroundColor: s.track }} />
                </View>
              );
            })
          )}
        </View>
      </View>
    </View>
  );
}
