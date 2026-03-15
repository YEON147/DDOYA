import { Text, View } from 'react-native';
import { colors } from '@/constants/theme/colors';

export default function TestScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 28, color: colors.text }}>
        기본 폰트 테스트
      </Text>

      <Text style={{ fontSize: 28, fontFamily: 'SCoreDreamExtraBold', color: colors.text }}>
        S-Core Dream 테스트
      </Text>
    </View>
  );
}