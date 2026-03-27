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
  const bodyPart = ocrResult.bodyPartName || '미분류';
  const ingredients = ocrResult.ingredients ?? [];
  const primaryIngredient = ingredients.find((ing) => ing.isPrimary) ?? ingredients[0];
  const secondaryIngredients = ingredients.filter((ing) => ing !== primaryIngredient);

  return (
    <>
      <Text className="mb-2 text-base font-scdream-medium" style={{ color: colors.text }}>
        {title}
      </Text>
      <View className="mb-4 overflow-hidden p-4" style={neuRaised(18, colors.surface)}>
        <Text className="text-xs font-scdream-medium tracking-wide" style={{ color: colors.textMuted }}>
          핵심 분석 결과
        </Text>

        <View className="mt-3 rounded-2xl px-4 py-3" style={{ backgroundColor: `${colors.point}14` }}>
          <Text className="text-xs font-scdream-medium" style={{ color: colors.point }}>
            어디에 도움돼요?
          </Text>
          <Text className="mt-1 text-lg font-scdream-bold" style={{ color: colors.text }}>
            {bodyPart}
          </Text>
        </View>

        <View className="mt-2 rounded-2xl px-4 py-3" style={{ backgroundColor: `${colors.background}B3` }}>
          <Text className="text-xs font-scdream-medium" style={{ color: colors.textMuted }}>
            주성분
          </Text>
          <Text className="mt-1 text-lg font-scdream-bold" style={{ color: colors.text }}>
            {primaryIngredient ? primaryIngredient.normalizedName : '분석된 성분 없음'}
          </Text>
          {primaryIngredient ? (
            <Text className="mt-1 text-sm font-scdream" style={{ color: colors.text }}>
              함량: {primaryIngredient.amount}
              {primaryIngredient.unit}
            </Text>
          ) : null}
          {primaryIngredient?.rawName ? (
            <Text className="mt-1 text-xs font-scdream" style={{ color: colors.textMuted }}>
              원문: {primaryIngredient.rawName}
            </Text>
          ) : null}
        </View>

        <View
          className="mt-3 flex-row items-center rounded-2xl px-3 py-3"
          style={{ backgroundColor: `${colors.textMuted}12` }}
        >
          <View className="flex-1 items-center">
            <Text className="text-xs font-scdream" style={{ color: colors.textMuted }}>
              1일 권장
            </Text>
            <Text className="mt-1 text-base font-scdream-medium" style={{ color: colors.text }}>
              {ocrResult.dailyDose}회
            </Text>
          </View>
          <View className="h-8 w-px" style={{ backgroundColor: `${colors.textMuted}44` }} />
          <View className="flex-1 items-center">
            <Text className="text-xs font-scdream" style={{ color: colors.textMuted }}>
              1회 섭취량
            </Text>
            <Text className="mt-1 text-base font-scdream-medium" style={{ color: colors.text }}>
              {ocrResult.dosePerIntake}정
            </Text>
          </View>
        </View>

        {secondaryIngredients.length > 0 ? (
          <View className="mt-4">
            <Text className="mb-2 text-xs font-scdream-medium tracking-wide" style={{ color: colors.textMuted }}>
              참고 성분
            </Text>
            {secondaryIngredients.map((ing, index) => (
              <View
                key={`${ing.normalizedIngredientId ?? 'unknown'}-${ing.rawName}-${index}`}
                className="mb-2 rounded-2xl px-3 py-3"
                style={{ backgroundColor: `${colors.background}A8` }}
              >
                <Text className="text-sm font-scdream-medium" style={{ color: colors.text }}>
                  {ing.normalizedName}
                </Text>
                <Text className="mt-1 text-sm font-scdream" style={{ color: colors.text }}>
                  함량: {ing.amount}
                  {ing.unit}
                </Text>
                <Text className="mt-1 text-xs font-scdream" style={{ color: colors.textMuted }}>
                  원문: {ing.rawName}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </>
  );
}
