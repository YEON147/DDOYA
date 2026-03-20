import { View, Text } from 'react-native';
import { NicknameHeader } from '@/src/components/common/HeaderMessage';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { HomeIntakeSlot } from '@/src/components/home/HomeIntakeSlot';
import { colors } from '@/constants/theme/colors';
import { neuInset } from '@/constants/theme/neumorphism';

/** 목업 슬롯 — API 연동 시 교체 */
const MOCK_INTAKE_SLOTS = [
  { timeLabel: '오전 7:40', placeholderCount: 3 },
  { timeLabel: '오후 1:30', placeholderCount: 2 },
  { timeLabel: '오후 7:20', placeholderCount: 3 },
];

export default function HomeScreen() {
  return (
    <ScreenContainer>
      <NicknameHeader message="잊지말고 섭취 인증을 해주세요!" messageTone="subtle" />

      <View className="mt-1 rounded-2xl px-4 py-3" style={neuInset(18, colors.surface)}>
        <View className="flex-row items-center justify-between">
          <Text className="text-[12px] font-scdream" style={{ color: colors.textMuted }}>
            오늘 루틴
          </Text>
          <Text className="text-[12px] font-scdream-medium" style={{ color: colors.text }}>
            3회
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
            다음 섭취 오전 7:40
          </Text>
        </View>
      </View>

      <View className="mt-4 px-1">
        <Text className="text-[13px] font-scdream-medium" style={{ color: colors.text }}>
          시간대별 섭취 루틴
        </Text>
      </View>

      <View className="mt-4 gap-4">
        {MOCK_INTAKE_SLOTS.map((slot) => (
          <HomeIntakeSlot
            key={slot.timeLabel}
            timeLabel={slot.timeLabel}
            placeholderCount={slot.placeholderCount}
          />
        ))}
      </View>
    </ScreenContainer>
  );
}
