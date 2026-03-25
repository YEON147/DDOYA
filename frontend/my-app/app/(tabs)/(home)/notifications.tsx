import { View, Text } from 'react-native';
import { Bell } from 'lucide-react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { AppIcon } from '@/src/components/common/AppIcon';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';

const MOCK_NOTIFICATIONS = [
  { id: 1, title: '섭취 시간 알림', message: '오전 7:40 섭취 시간이 되었어요.' },
  { id: 2, title: '재고 알림', message: '비타민D 재고가 3일치 이하로 남아있어요.' },
  { id: 3, title: '루틴 달성', message: '오늘의 루틴 1회를 완료했어요. 잘하고 있어요!' },
];

export default function NotificationsScreen() {
  return (
    <ScreenContainer scrollable={false} padding={0} header={<TopHeader title="알림센터" />}>
      <View className="flex-1 px-5 py-4" style={{ backgroundColor: colors.background }}>
        {MOCK_NOTIFICATIONS.map((item) => (
          <View
            key={item.id}
            className="mb-3 rounded-2xl px-4 py-3.5"
            style={neuRaised(16, colors.surface)}
          >
            <View className="mb-1.5 flex-row items-center">
              <View className="mr-2 h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.primary}1A` }}>
                <AppIcon icon={Bell} size={14} color={colors.primary} />
              </View>
              <Text className="text-[13px] font-scdream-medium" style={{ color: colors.text }}>
                {item.title}
              </Text>
            </View>
            <Text className="text-[12px] font-scdream leading-5" style={{ color: colors.textMuted }}>
              {item.message}
            </Text>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}
