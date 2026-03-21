import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';

/** OCR 촬영·인식 화면 — 웹/네이티브 공통 라우트용 플레이스홀더 */
export default function SupplementOcrScreen() {
  const router = useRouter();

  return (
    <ScreenContainer scrollable={false} padding={0} header={<TopHeader title="성분표 촬영" />}>
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
        <Text className="mb-4 text-center font-scdream" style={{ color: colors.textMuted }}>
          OCR 화면은 연결 예정입니다.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.9}
          className="px-6 py-3"
          style={neuRaised(999, colors.point)}
        >
          <Text className="font-semibold text-white">돌아가기</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
