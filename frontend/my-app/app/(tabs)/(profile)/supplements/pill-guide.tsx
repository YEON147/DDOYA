import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { CaptureGuideScreenLayout } from '@/src/components/common/CaptureGuideScreenLayout';
import { OcrResultSummary } from '@/src/components/supplement/OcrResultSummary';
import { useSupplementCreateStore } from '@/src/store/supplementCreateStore';
import {
  useCreateSupplementMutation,
  getCreateSupplementErrorMessage,
} from '@/hooks/useSupplementMutation';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';

const PILL_GUIDE_IMAGE = require('../../../../assets/images/intake_verify_example.jpg');

type Phase = 'guide' | 'preview';

/** STEP 2: 알약 한 알 촬영 가이드 → 촬영 완료 후 등록하기(multipart) */
export default function SupplementPillGuideScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('guide');

  const ocrResult = useSupplementCreateStore((s) => s.ocrResult);
  const pillImageUri = useSupplementCreateStore((s) => s.pillImageUri);
  const pillImageMimeType = useSupplementCreateStore((s) => s.pillImageMimeType);
  const setPillImageUri = useSupplementCreateStore((s) => s.setPillImageUri);
  const buildAutoRegisterRequest = useSupplementCreateStore((s) => s.buildAutoRegisterRequest);
  const reset = useSupplementCreateStore((s) => s.reset);

  const createMutation = useCreateSupplementMutation();

  useEffect(() => {
    if (!ocrResult) {
      router.replace('/(tabs)/(profile)/supplements/create' as never);
    }
  }, [ocrResult, router]);

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
        quality: 0.75,
        allowsEditing: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const uri = asset?.uri;
      if (!uri) {
        Alert.alert('오류', '촬영 결과를 불러오지 못했습니다.');
        return;
      }
      setPillImageUri(uri, asset.mimeType ?? null);
      setPhase('preview');
    } catch {
      Alert.alert('오류', '촬영에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleRetake = useCallback(() => {
    setPillImageUri(null);
    setPhase('guide');
  }, [setPillImageUri]);

  const handleRegister = () => {
    if (!pillImageUri) return;
    const register = buildAutoRegisterRequest();
    if (!register) {
      Alert.alert('등록 불가', '성분 분석 결과가 없습니다. 처음부터 다시 진행해 주세요.');
      return;
    }

    createMutation.mutate(
      {
        pillUri: pillImageUri,
        pillMimeType: pillImageMimeType,
        register,
      },
      {
        onSuccess: () => {
          reset();
          setPhase('guide');
          Alert.alert('완료', '영양제가 등록되었습니다.', [
            { text: '확인', onPress: () => router.replace('/(tabs)/(profile)/supplements' as never) },
          ]);
        },
        onError: (error) => {
          Alert.alert('등록 실패', getCreateSupplementErrorMessage(error));
        },
      }
    );
  };

  if (!ocrResult) {
    return null;
  }

  if (phase === 'guide') {
    return (
      <ScreenContainer scrollable={false} padding={0} header={<TopHeader title="알약 촬영" />}>
        <CaptureGuideScreenLayout
          guideLabel="촬영 가이드 · 알약 한 알"
          guideImageSource={PILL_GUIDE_IMAGE}
          guideImageResizeMode="contain"
          instructionText="용기에서 알약 한 알만 꺼내, 배경과 구분되게 선명하게 촬영해 주세요."
          primaryLabel="촬영하기"
          onPrimary={handleCapture}
          secondaryLabel="돌아가기"
          onSecondary={() => router.back()}
          webNote="웹에서는 카메라 촬영을 지원하지 않습니다."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable padding={0} header={<TopHeader title="알약 촬영" />}>
      <View className="px-6 pt-2 pb-8" style={{ backgroundColor: colors.background }}>
        <Text className="mb-3 text-center font-scdream" style={{ color: colors.textMuted }}>
          촬영이 완료되었어요. 등록하기를 누르면 서버에 저장됩니다.
        </Text>

        {pillImageUri ? (
          <View
            className="mb-4 w-full max-w-[360px] self-center overflow-hidden rounded-3xl"
            style={[neuRaised(24, colors.surface), { aspectRatio: 1 }]}
          >
            <Image source={{ uri: pillImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
          </View>
        ) : null}

        <OcrResultSummary ocrResult={ocrResult} title="등록에 포함될 성분 (OCR)" />

        {createMutation.isPending ? (
          <ActivityIndicator className="my-4" color={colors.point} />
        ) : null}

        <TouchableOpacity
          onPress={handleRegister}
          disabled={createMutation.isPending || !pillImageUri}
          activeOpacity={0.9}
          className="items-center px-6 py-3"
          style={[
            neuRaised(999, colors.point),
            (createMutation.isPending || !pillImageUri) && { opacity: 0.45 },
          ]}
        >
          <Text className="font-semibold text-white">등록하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRetake}
          disabled={createMutation.isPending}
          activeOpacity={0.9}
          className="mx-0 mt-4 items-center px-6 py-3"
          style={[neuRaised(999, colors.surface), createMutation.isPending && { opacity: 0.45 }]}
        >
          <Text className="font-semibold" style={{ color: colors.text }}>
            다시 촬영
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
