import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { useSupplementCreateStore } from '@/src/store/supplementCreateStore';
import { supplementApi } from '@/src/api/supplement';
import { ingredientAnalyzeToOcrResult } from '@/src/types/supplement';
import axios from 'axios';
import { getBackendErrorMessage } from '@/hooks/apiErrorMessage';
import { prepareLabelImageForOcr } from '@/src/utils/labelImageForUpload';
import { OcrResultSummary } from '@/src/components/supplement/OcrResultSummary';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';

/** 업로드 직전 `prepareLabelImageForOcr` 로 JPEG 고정 */
function buildIngredientsOcrFormData(jpegUri: string): FormData {
  const formData = new FormData();
  formData.append(
    'ingredientsImg',
    { uri: jpegUri, name: 'label.jpg', type: 'image/jpeg' } as unknown as Blob
  );
  return formData;
}

type OcrPhase = 'analyzing' | 'success' | 'error';

export default function SupplementLabelPreviewScreen() {
  const router = useRouter();
  const ingredientLabelUri = useSupplementCreateStore((s) => s.ingredientLabelUri);
  const setIngredientLabelUri = useSupplementCreateStore((s) => s.setIngredientLabelUri);
  const setOcrResult = useSupplementCreateStore((s) => s.setOcrResult);
  const ocrResult = useSupplementCreateStore((s) => s.ocrResult);

  const [ocrPhase, setOcrPhase] = useState<OcrPhase>('analyzing');

  useEffect(() => {
    if (!ingredientLabelUri) {
      router.replace('/supplements/create' as never);
    }
  }, [ingredientLabelUri, router]);

  useEffect(() => {
    if (!ingredientLabelUri) return;

    let cancelled = false;
    setOcrPhase('analyzing');
    setOcrResult(null);

    (async () => {
      try {
        let prepared = await prepareLabelImageForOcr(ingredientLabelUri, 'normal');
        if (cancelled) return;

        let res;
        try {
          res = await supplementApi.analyzeIngredientsOcr(buildIngredientsOcrFormData(prepared.uri));
        } catch (firstErr) {
          if (
            !cancelled &&
            axios.isAxiosError(firstErr) &&
            firstErr.response?.status === 413
          ) {
            prepared = await prepareLabelImageForOcr(ingredientLabelUri, 'strong');
            if (cancelled) return;
            res = await supplementApi.analyzeIngredientsOcr(buildIngredientsOcrFormData(prepared.uri));
          } else {
            throw firstErr;
          }
        }

        if (cancelled) return;

        const payload = res.data.data;
        if (!payload.success) {
          setOcrPhase('error');
          Alert.alert('분석 실패', payload.message || '성분표를 다시 촬영해 주세요.');
          return;
        }

        setOcrResult(ingredientAnalyzeToOcrResult(payload));
        setOcrPhase('success');
      } catch (e) {
        if (cancelled) return;
        setOcrPhase('error');
        const msg = (() => {
          if (axios.isAxiosError(e)) {
            if (e.response?.status === 413) {
              return '이미지가 너무 큽니다. 다시 촬영해 주세요.';
            }
            if (!e.response && e.message) {
              return '네트워크를 확인한 뒤 다시 시도해 주세요.';
            }
          }
          return getBackendErrorMessage(e, '성분표 분석 중 오류가 발생했습니다.');
        })();
        Alert.alert('분석 오류', msg);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ingredientLabelUri, setOcrResult]);

  const handleNext = useCallback(() => {
    if (ocrPhase !== 'success') return;
    router.push('/(tabs)/(profile)/supplements/pill-guide' as never);
  }, [ocrPhase, router]);

  const handleRetake = () => {
    setIngredientLabelUri(null);
    setOcrResult(null);
    router.back();
  };

  if (!ingredientLabelUri) {
    return null;
  }

  const instruction =
    ocrPhase === 'analyzing'
      ? '촬영한 사진에서 성분표를 분석하고 있어요.'
      : ocrPhase === 'success'
        ? '분석이 완료되었어요. 알약 촬영 가이드로 이동하려면 다음을 눌러 주세요.'
        : '분석에 실패했어요. 다시 촬영해 주세요.';

  return (
    <ScreenContainer
      scrollable
      padding={0}
      contentContainerStyle={{ flexGrow: 1 }}
      header={<TopHeader title="성분표 확인" />}
    >
      <View className="flex-1 px-6 pt-2 pb-8" style={{ backgroundColor: colors.background }}>
        {/* 성공 시: 촬영 원본은 표시하지 않고 OCR 결과 데이터만 우선 노출 */}
        {ocrPhase === 'success' && ocrResult ? (
          <>
            <OcrResultSummary ocrResult={ocrResult} title="성분표 (OCR 결과)" />
            <Text className="mb-4 mt-1 text-center text-sm font-scdream" style={{ color: colors.textMuted }}>
              알약 촬영으로 넘어가려면 아래 「다음」을 눌러 주세요.
            </Text>
          </>
        ) : (
          <>
            <Text className="mb-3 text-center font-scdream" style={{ color: colors.textMuted }}>
              {instruction}
            </Text>

            {ocrPhase === 'analyzing' ? (
              <View className="mb-6 items-center rounded-3xl px-5 py-8" style={neuRaised(24, colors.surface)}>
                <ActivityIndicator size="large" color={colors.point} />
                <Text className="mt-3 text-center text-sm font-scdream-medium" style={{ color: colors.text }}>
                  OCR 분석 중…
                </Text>
              </View>
            ) : null}
          </>
        )}

        <View className="mt-6">
          <TouchableOpacity
            onPress={handleNext}
            disabled={ocrPhase !== 'success'}
            activeOpacity={0.9}
            className="items-center px-6 py-3"
            style={[neuRaised(999, colors.point), ocrPhase !== 'success' && { opacity: 0.45 }]}
          >
            <Text className="font-semibold text-white">다음</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRetake}
            activeOpacity={0.9}
            className="mx-0 mt-4 items-center px-6 py-3"
            style={neuRaised(999, colors.surface)}
          >
            <Text className="font-semibold" style={{ color: colors.text }}>
              다시 촬영
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
