import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';

/** STEP 2: 알약 촬영 화면 — 촬영 후 `setPillImageUri` 호출 뒤 확인 단계로 이동 */
export default function SupplementPillScreen() {
  const router = useRouter();

  return (
    <ScreenContainer scrollable={false} padding={0} header={<TopHeader title="알약 촬영" />}>
      <View className="flex-1 items-center justify-center px-10">
        <Text className="text-gray-600 text-center mb-6">알약 촬영 UI는 이후 연결합니다.</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/(profile)/supplements/confirm')}
          className="bg-blue-500 px-8 py-3 rounded-full"
        >
          <Text className="text-white font-bold">다음: 별칭·총량 입력</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
