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
      <View className="mb-4 p-3" style={neuRaised(18, colors.surface)}>
        <Text className="mb-1 text-sm font-scdream" style={{ color: colors.textMuted }}>
          부위: {ocrResult.bodyPartName} · 1일 권장 {ocrResult.dailyDose} · 1회 {ocrResult.dosePerIntake}
        </Text>
        {ocrResult.ingredients.map((ing) => (
          <Text
            key={`${ing.normalizedIngredientId}-${ing.rawName}`}
            className="py-1 text-sm font-scdream"
            style={{ color: colors.text }}
          >
            {ing.isPrimary ? '★ ' : '· '}
            {ing.normalizedName} {ing.amount}
            {ing.unit} ({ing.rawName})
          </Text>
        ))}
      </View>
    </>
  );
}
