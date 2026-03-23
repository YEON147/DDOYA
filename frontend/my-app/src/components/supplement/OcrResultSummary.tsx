import React from 'react';
import { View, Text } from 'react-native';
import type { OcrResult } from '@/src/types/supplement';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';

type OcrResultSummaryProps = {
  ocrResult: OcrResult;
  title?: string;
};

/** 성분표 OCR 결과 블록 (등록 확인·OCR 직후 화면에서 공통 사용) */
export function OcrResultSummary({ ocrResult, title = '성분표 (OCR 결과)' }: OcrResultSummaryProps) {
  return (
    <>
      <Text className="text-base font-scdream-medium mb-2" style={{ color: colors.text }}>
        {title}
      </Text>
      <View className="mb-4 p-4" style={neuRaised(18, colors.surface)}>
        <Text className="text-sm font-scdream" style={{ color: colors.textMuted }}>
          부위: {ocrResult.bodyPartName}
        </Text>
        <Text className="mt-1 text-sm font-scdream" style={{ color: colors.textMuted }}>
          1일 권장: {ocrResult.dailyDose}회 · 1회 섭취량: {ocrResult.dosePerIntake}
        </Text>
        <Text className="mt-1 text-sm font-scdream" style={{ color: colors.textMuted }}>
          인식 성분: {ocrResult.ingredients.length}개
        </Text>

        <View className="mt-3">
          {ocrResult.ingredients.map((ing, index) => (
            <View
              key={`${ing.normalizedIngredientId ?? 'unknown'}-${ing.rawName}-${index}`}
              className="py-2"
            >
              <Text className="text-sm font-scdream" style={{ color: colors.text }}>
                {ing.isPrimary ? '★ 주성분' : '· 성분'}: {ing.normalizedName}
              </Text>
              <Text className="mt-0.5 text-sm font-scdream" style={{ color: colors.text }}>
                함량: {ing.amount}
                {ing.unit}
              </Text>
              <Text className="mt-0.5 text-sm font-scdream" style={{ color: colors.textMuted }}>
                원문: {ing.rawName}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}
