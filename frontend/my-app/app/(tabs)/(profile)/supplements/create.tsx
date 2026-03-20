import React from 'react';
import { View, Text, TouchableOpacity, Button, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { useCameraPermissions } from 'expo-camera';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';

export default function SupplementCreateScreen() {
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();

  const skipPermissionOnWeb = Platform.OS === 'web';

  if (!skipPermissionOnWeb) {
    if (!permission) {
      return <View style={{ flex: 1, backgroundColor: colors.background }} />;
    }
    if (!permission.granted) {
      return (
        <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
          <Text className="mb-4 text-center font-scdream" style={{ color: colors.text }}>
            We need your permission to show the camera
          </Text>
          <Button onPress={requestPermission} title="grant permission" />
        </View>
      );
    }
  }

  return (
    <ScreenContainer scrollable={false} padding={0} header={<TopHeader title="영양제 등록" />}>
      <View className="flex-1 items-center justify-center px-10" style={{ backgroundColor: colors.background }}>
        <View
          className="mb-6 items-center justify-center rounded-full p-7"
          style={neuRaised(999, colors.surface)}
        >
          <Ionicons name="camera-outline" size={60} color={colors.primary} />
        </View>
        <Text className="mb-2 text-2xl font-bold" style={{ color: colors.text }}>STEP 1</Text>
        <Text className="mb-8 text-center text-lg" style={{ color: colors.textMuted }}>
          성분표가 보이도록 촬영해주세요 !
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.9}
          className="px-8 py-3.5"
          style={neuRaised(999, colors.point)}
        >
          <Text className="text-lg font-bold text-white">돌아가기</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
