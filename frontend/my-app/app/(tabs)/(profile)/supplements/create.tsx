import React from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { CaptureGuideScreenLayout } from '@/src/components/common/CaptureGuideScreenLayout';
import { useSupplementCreateStore } from '@/src/store/supplementCreateStore';
import { appAlert } from '@/src/utils/appAlert';
 
const REGISTER_GUIDE_IMAGE = require('../../../../assets/images/ocr_example.jpg');

export default function SupplementCreateScreen() {
  const router = useRouter();
  const setIngredientLabelUri = useSupplementCreateStore((s) => s.setIngredientLabelUri);
  const setOcrResult = useSupplementCreateStore((s) => s.setOcrResult);

  const handleCapture = async () => {
    if (Platform.OS === 'web') {
      appAlert('안내', '웹에서는 카메라 촬영을 지원하지 않습니다.');
      return;
    }
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        appAlert('안내', '카메라 권한이 필요합니다.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.55,
        allowsEditing: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const uri = asset?.uri;
      if (!uri) {
        appAlert('오류', '촬영 결과를 불러오지 못했습니다.');
        return;
      }
      setOcrResult(null);
      setIngredientLabelUri(uri, asset.mimeType ?? null);
      router.push('/supplements/label-preview' as never);
    } catch {
      appAlert('오류', '촬영에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <ScreenContainer scrollable={false} padding={0} header={<TopHeader title="" />}>
      <CaptureGuideScreenLayout
        guideLabel="촬영 가이드 (예시 이미지)"
        guideImageSource={REGISTER_GUIDE_IMAGE}
        guideImageResizeMode="contain"
        instructionText="성분표가 보이도록 촬영해주세요 !"
        primaryLabel="촬영하기"
        onPrimary={handleCapture}
        secondaryLabel="돌아가기"
        onSecondary={() => router.back()}
      />
    </ScreenContainer>
  );
}
