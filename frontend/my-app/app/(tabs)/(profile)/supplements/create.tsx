import React from 'react';
import { View, Text, TouchableOpacity, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { useCameraPermissions } from 'expo-camera';
// OCR 성공 시: useSupplementCreateStore.getState().setOcrResult(data)

export default function SupplementCreateScreen() {
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <ScreenContainer
      scrollable={false}
      padding={0}
      header={<TopHeader title="영양제 등록" />}
    >

      <View className="flex-1 items-center justify-center px-10">
        <View className="bg-blue-50 p-6 rounded-full mb-6">
          <Ionicons name="construct-outline" size={60} color="#3b82f6" />
        </View>
        <Text className="text-2xl font-bold text-gray-800 mb-2">STEP 1</Text>
        {/* 촬영이동버튼 */}
        <Text className="text-gray-500 text-center text-lg mb-8">
          성분표가 보이도록 촬영해주세요 !
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-500 px-8 py-3 rounded-full shadow-md"
        >
          <Text className="text-white font-bold text-lg">돌아가기</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
