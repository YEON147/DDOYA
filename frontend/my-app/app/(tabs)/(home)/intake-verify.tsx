import React, { useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { CaptureGuideScreenLayout } from '@/src/components/common/CaptureGuideScreenLayout';
import { buildIntakeCertificationFormData, intakeRoutineApi } from '@/src/api/intakeRoutine';
import { prepareLabelImageForOcr } from '@/src/utils/labelImageForUpload';
import { colors } from '@/constants/theme/colors';
import apiClient from '@/src/api/client';
import { appAlert } from '@/src/utils/appAlert';

const INTAKE_GUIDE_IMAGE = require('../../../assets/images/intake_verify_example.jpg');

export default function IntakeVerifyScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { scheduleIds } = useLocalSearchParams<{ scheduleIds?: string }>();
  const [isProcessing, setIsProcessing] = useState(false);

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
        quality: 0.85,
        allowsEditing: false,
      });
      if (result.canceled) return;
      const uri = result.assets[0]?.uri;
      if (!uri) {
        appAlert('오류', '촬영 결과를 불러오지 못했습니다.');
        return;
      }

      const parsedScheduleIds = (scheduleIds ?? '')
        .split(',')
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v) && v > 0);

      if (parsedScheduleIds.length === 0) {
        appAlert('안내', '인증 대상 스케줄이 없습니다. 홈에서 다시 시도해 주세요.');
        return;
      }

      const request = {
        expectedSchedules: parsedScheduleIds.map((id) => ({ scheduleId: id })),
      };
      setIsProcessing(true);
      try {
        // 413 대응: 업로드 전 리사이즈/압축(JPEG)해서 용량 줄임
        let prepared = await prepareLabelImageForOcr(uri, 'normal');

        const formData = buildIntakeCertificationFormData(prepared.uri, request, prepared.mimeType);
        console.log('[intake-verify] calling verify api', {
          scheduleIds: parsedScheduleIds,
          originalUri: uri,
          preparedUri: prepared.uri,
        });

        const res = await intakeRoutineApi.postIntakeCertification(formData);
        const certificationResult = res.data.data;

        await queryClient.invalidateQueries({ queryKey: ['dailyIntakeSchedule'] });

        const matchedCount = certificationResult.results.filter((r) => r.matched).length;
        appAlert(
          certificationResult.success ? '인증 완료' : '인증 결과',
          `${certificationResult.message}\n일치 ${matchedCount}/${certificationResult.results.length}건`,
          [{ text: '확인', onPress: () => router.back() }],
        );
      } catch (apiErr) {
        // 413(용량 초과)면 한 단계 더 압축해서 재시도
        if (axios.isAxiosError(apiErr) && apiErr.response?.status === 413) {
          const preparedStrong = await prepareLabelImageForOcr(uri, 'strong');
          const formData = buildIntakeCertificationFormData(preparedStrong.uri, request, preparedStrong.mimeType);
          const res = await intakeRoutineApi.postIntakeCertification(formData);
          const certificationResult = res.data.data;

          await queryClient.invalidateQueries({ queryKey: ['dailyIntakeSchedule'] });
          const matchedCount = certificationResult.results.filter((r) => r.matched).length;
          appAlert(
            certificationResult.success ? '인증 완료' : '인증 결과',
            `${certificationResult.message}\n일치 ${matchedCount}/${certificationResult.results.length}건`,
            [{ text: '확인', onPress: () => router.back() }],
          );
          return;
        }
        throw apiErr;
      }
    } catch (e) {
      console.error('[intake-verify] failed', e);
      const anyErr = e as any;
      const status = anyErr?.response?.status;
      const reqUrl = anyErr?.config?.url ?? anyErr?.response?.config?.url;
      const baseURL = anyErr?.config?.baseURL ?? apiClient.defaults.baseURL;
      const serverMessage = anyErr?.response?.data?.message ?? anyErr?.response?.data?.data?.message ?? null;
      const fallbackMessage = anyErr?.message ?? '알 수 없는 오류';
      appAlert(
        '인증 실패',
        status
          ? `${status} ${serverMessage ? String(serverMessage) : String(fallbackMessage)}\n${baseURL ?? ''}${reqUrl ?? ''}`
          : serverMessage
            ? String(serverMessage)
            : String(fallbackMessage),
      );
    } finally {
      setIsProcessing(false);
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
        topOverlay={
          isProcessing ? (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.12)',
              }}
            >
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : undefined
        }
      />
    </ScreenContainer>
  );
}
