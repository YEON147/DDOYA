import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { CaptureGuideScreenLayout } from '@/src/components/common/CaptureGuideScreenLayout';
import { OcrResultSummary } from '@/src/components/supplement/OcrResultSummary';
import { useSupplementCreateStore } from '@/src/store/supplementCreateStore';
import {
  useCreateSupplementMutation,
  getCreateSupplementErrorMessage,
} from '@/hooks/useSupplementMutation';
import { buildPillValidateFormData, supplementApi } from '@/src/api/supplement';
import { getBackendErrorMessage } from '@/hooks/apiErrorMessage';
import { prepareLabelImageForOcr } from '@/src/utils/labelImageForUpload';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';

const PILL_GUIDE_IMAGE = require('../../../../assets/images/intake_verify_example.jpg');

type Phase = 'guide' | 'preview';
type ValidatePhase = 'idle' | 'checking' | 'done';

/** STEP 2: 알약 한 알 촬영 가이드 → 촬영 완료 후 등록하기(multipart) */
export default function SupplementPillGuideScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('guide');
  const [validatePhase, setValidatePhase] = useState<ValidatePhase>('idle');
  const [validateResult, setValidateResult] = useState<{ success: boolean; message: string } | null>(null);

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
      setValidatePhase('checking');
      setValidateResult(null);

      try {
        let prepared = await prepareLabelImageForOcr(uri, 'normal');
        let payload;
        try {
          const fd = buildPillValidateFormData(prepared.uri, 'image/jpeg');
          const res = await supplementApi.validatePillForRegister(fd);
          payload = res.data.data;
        } catch (firstErr) {
          if (axios.isAxiosError(firstErr) && firstErr.response?.status === 413) {
            prepared = await prepareLabelImageForOcr(uri, 'strong');
            const fd = buildPillValidateFormData(prepared.uri, 'image/jpeg');
            const res = await supplementApi.validatePillForRegister(fd);
            payload = res.data.data;
          } else {
            throw firstErr;
          }
        }
        setValidateResult(payload);
        setValidatePhase('done');
      } catch (e) {
        setValidateResult({
          success: false,
          message: getBackendErrorMessage(e, '등록 가능 여부 확인에 실패했습니다. 다시 촬영해 주세요.'),
        });
        setValidatePhase('done');
      }
    } catch {
      Alert.alert('오류', '촬영에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleRetake = useCallback(() => {
    setPillImageUri(null);
    setValidatePhase('idle');
    setValidateResult(null);
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

  const topInstruction =
    validatePhase !== 'done'
      ? '촬영 이미지를 확인하고 등록 가능 여부를 검사하고 있어요.'
      : validateResult && !validateResult.success
        ? '등록 불가입니다. 알약 이미지를 재촬영해 주세요.'
        : '등록 가능 여부 검사가 완료되었어요. 등록하기를 누르면 내 영양제제에 저장됩니다.';

  return (
    <ScreenContainer scrollable padding={0} header={<TopHeader title="알약 촬영" />}>
      <View className="px-6 pt-2 pb-8" style={{ backgroundColor: colors.background }}>
        <Text className="mb-3 text-center font-scdream" style={{ color: colors.textMuted }}>
          {topInstruction}
        </Text>

        <View className="mb-4 rounded-2xl px-4 py-3" style={neuRaised(16, colors.surface)}>
          <Text className="text-xs font-scdream-medium tracking-wide" style={{ color: colors.textMuted }}>
            등록 가능 여부 검사
          </Text>
          {validatePhase === 'checking' ? (
            <View className="mt-2 flex-row items-center">
              <ActivityIndicator size="small" color={colors.point} />
              <Text className="ml-2 text-sm font-scdream" style={{ color: colors.text }}>
                이미지 검증 중...
              </Text>
            </View>
          ) : validateResult ? (
            <>
              <Text className="mt-2 text-xs font-scdream" style={{ color: colors.textMuted }}>
                가능 여부
              </Text>
              <Text
                className="mt-0.5 text-base font-scdream-bold"
                style={{ color: validateResult.success ? colors.point : '#DC2626' }}
              >
                {validateResult.success ? '등록 가능' : '등록 불가'}
              </Text>
              <Text className="mt-2 text-xs font-scdream" style={{ color: colors.textMuted }}>
                사유
              </Text>
              <Text className="mt-0.5 text-sm font-scdream" style={{ color: colors.text }}>
                {validateResult.message}
              </Text>
            </>
          ) : (
            <Text className="mt-2 text-sm font-scdream" style={{ color: colors.textMuted }}>
              촬영 후 자동으로 검사됩니다.
            </Text>
          )}
        </View>

        <OcrResultSummary ocrResult={ocrResult} title="등록에 포함될 성분 (OCR)" />

        {createMutation.isPending ? (
          <ActivityIndicator className="my-4" color={colors.point} />
        ) : null}

        <TouchableOpacity
          onPress={handleRegister}
          disabled={
            createMutation.isPending ||
            !pillImageUri ||
            validatePhase !== 'done' ||
            !validateResult?.success
          }
          activeOpacity={0.9}
          className="items-center px-6 py-3"
          style={[
            neuRaised(999, colors.point),
            (
              createMutation.isPending ||
              !pillImageUri ||
              validatePhase !== 'done' ||
              !validateResult?.success
            ) && { opacity: 0.45 },
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
