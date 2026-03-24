import { View, Text, Pressable } from 'react-native';
import { Camera } from 'lucide-react-native';
import { colors } from '@/constants/theme/colors';
import { neuInset, neuRaised } from '@/constants/theme/neumorphism';
import { AppIcon } from '@/src/components/common/AppIcon';
import type { DailyIntakeScheduleSlotItem } from '@/src/types/intakeRoutine';

export type HomeIntakeSlotProps = {
  timeLabel: string;
  items: DailyIntakeScheduleSlotItem[];
  onPressCamera?: () => void;
};

function statusStyle(status: DailyIntakeScheduleSlotItem['status']) {
  switch (status) {
    case 'TAKEN':
      return { bg: `${colors.primary}22`, bar: colors.primary };
    case 'MISSED':
      return { bg: '#EF444422', bar: '#EF4444' };
    case 'SKIPPED':
    default:
      return { bg: `${colors.shadowLight}99`, bar: `${colors.shadowDark}60` };
  }
}

/** 홈 — 시간대별 섭취 인증 카드 */
export function HomeIntakeSlot({ timeLabel, items, onPressCamera }: HomeIntakeSlotProps) {
  return (
    <View>
      <View
        className="rounded-3xl px-3.5 py-3.5"
        style={neuRaised(26, colors.surface)}
      >
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View
              className="mr-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: colors.input, borderWidth: 1, borderColor: `${colors.shadowDark}40` }}
            >
              <Text className="text-[11px] font-scdream" style={{ color: colors.text }}>
                섭취 시간
              </Text>
            </View>
            <Text className="ml-2 text-[16px] font-scdream-medium" style={{ color: colors.text }}>
              {timeLabel}
            </Text>
          </View>
          <Pressable
            onPress={onPressCamera}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="h-8 w-8 items-center justify-center rounded-full"
            style={({ pressed }) => ({
              backgroundColor: colors.input,
              borderWidth: 1,
              borderColor: `${colors.shadowDark}44`,
              opacity: pressed ? 0.82 : 1,
            })}
          >
            <AppIcon icon={Camera} size={15} color={colors.text} />
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
                  className="mb-2 rounded-xl p-1.5"
                  style={[
                    neuInset(12),
                    {
                      width: '31.5%',
                      aspectRatio: 1,
                      marginRight: (i + 1) % 3 === 0 ? 0 : '2.75%',
                    },
                  ]}
                >
                  <View
                    className="mb-1.5 flex-1 justify-center rounded-md px-1 py-0.5"
                    style={{
                      minHeight: 40,
                      backgroundColor: s.bg,
                      borderWidth: 1,
                      borderColor: `${colors.shadowDark}26`,
                    }}
                  >
                    <Text
                      className="text-[10px] font-scdream-medium leading-tight"
                      style={{ color: colors.text }}
                      numberOfLines={3}
                    >
                      {item.alias}
                    </Text>
                    <Text className="mt-0.5 text-[9px] font-scdream" style={{ color: colors.textMuted }}>
                      {item.dosePerIntake}정
                    </Text>
                  </View>
                  <View className="h-2 rounded-full" style={{ backgroundColor: s.bar }} />
                </View>
              );
            })
          )}
        </View>
      </View>
    </View>
  );
}
