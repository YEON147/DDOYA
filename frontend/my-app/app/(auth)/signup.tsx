import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../src/components/common/AppButton';
import { router } from 'expo-router';

export default function SignupScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-6 gap-6">
      <Text className="text-2xl font-bold">회원가입 페이지</Text>
      <Text className="text-gray-500 text-center">
        실제 회원가입 폼 및 통신은 다음 단계에서 구현합니다.
      </Text>
      <AppButton
        className="w-full"
        title="뒤로가기"
        onPress={() => router.back()}
      />
    </SafeAreaView>
  );
}
