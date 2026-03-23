import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '@/constants/theme/colors';

interface AnalysisReportProps {
  summary: string;
  analysisResult: string;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({ summary, analysisResult }) => {
  return (
    <View className="mb-8">
      <View className="flex-row items-center mb-4">
        {/* 아이콘 (이미지에 있는 확성기/리포트 아이콘 대용) */}
        <Text className="text-2xl mr-2">📢</Text>
        <Text className="text-lg font-bold" style={{ color: colors.text }}>분석 리포트</Text>
      </View>
      
      <View className="p-6 rounded-[24px] border border-gray-100 shadow-sm bg-white">
        <Text className="text-base leading-7 font-medium mb-4" style={{ color: colors.text }}>
          {summary}
        </Text>
        <View className="h-[1px] bg-gray-100 mb-4" />
        <Text className="text-sm leading-6 text-gray-500">
          {analysisResult}
        </Text>
      </View>
    </View>
  );
};
