import { View, Text } from 'react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';

export default function ReportsScreen() {
  const mockReport = {
    date: '2024-03-15',
    summary: '영양제 섭취율이 90%로 매우 높습니다. 꾸준한 섭취를 유지하세요.',
  };

  return (
    <ScreenContainer header={<TopHeader title="리포트" />}>
      <View className="py-6">
        <Text className="mb-2 text-sm font-scdream" style={{ color: colors.textMuted }}>
          {mockReport.date} 리포트
        </Text>
        <View className="p-6" style={neuRaised(24, colors.surface)}>
          <Text className="text-base font-scdream leading-relaxed" style={{ color: colors.text }}>
            {mockReport.summary}
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
