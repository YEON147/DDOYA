import React from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { CaptureGuideScreenLayout } from '@/src/components/common/CaptureGuideScreenLayout';

const INTAKE_GUIDE_IMAGE = require('../../../assets/images/intake_verify_example.jpg');

export default function IntakeVerifyScreen() {
  const router = useRouter();

  const handleCapture = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('안내', '웹에서는 카메라 촬영을 지원하지 않습니다.');
      return;
    }
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('안내', '카메라 권한이 필요합니다.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsEditing: false,
      });
      if (result.canceled) return;
      const uri = result.assets[0]?.uri;
      if (!uri) {
        Alert.alert('오류', '촬영 결과를 불러오지 못했습니다.');
        return;
      }
      Alert.alert('완료', '촬영이 완료되었습니다.');
    } catch {
      Alert.alert('오류', '촬영에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <ScreenContainer scrollable={false} padding={0} header={<TopHeader title="섭취 인증 촬영" />}>
      <CaptureGuideScreenLayout
        guideLabel="촬영 가이드 (예시 이미지)"
        guideImageSource={INTAKE_GUIDE_IMAGE}
        guideImageResizeMode="contain"
        instructionText="영양제가 선명하게 보이도록 촬영해주세요."
        primaryLabel="촬영하기"
        onPrimary={handleCapture}
        secondaryLabel="돌아가기"
        onSecondary={() => router.back()}
        webNote="웹에서는 카메라 촬영을 지원하지 않습니다."
      />
    </ScreenContainer>
  );
}
