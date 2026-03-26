import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '@/constants/theme/colors';
import { ReportComments } from '@/src/types/report';

interface AnalysisReportProps {
  comments: ReportComments | null;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({ comments }) => {
  if (!comments) return null;

  return (
    <View className="mb-8">
      <View className="flex-row items-center mb-4">
        <Text className="text-2xl mr-2">📢</Text>
        <Text className="text-lg font-bold" style={{ color: colors.text }}>분석 리포트</Text>
      </View>
      
      <View className="p-6 rounded-[24px] border border-gray-100 shadow-sm bg-white">
        {comments.excessComment && (
          <View className="mb-4">
            <Text className="text-xs font-bold text-orange-400 mb-1">과잉 섭취 주의</Text>
            <Text className="text-sm leading-6 text-gray-600">{comments.excessComment}</Text>
          </View>
        )}
        
        {comments.deficiencyComment && (
          <View className="mb-4">
            <Text className="text-xs font-bold text-blue-400 mb-1">부족 성분 보완</Text>
            <Text className="text-sm leading-6 text-gray-600">{comments.deficiencyComment}</Text>
          </View>
        )}

        {(comments.excessComment || comments.deficiencyComment) && <View className="h-[1px] bg-gray-50 my-2" />}

        {comments.productComment && (
          <View className="mt-2">
            <Text className="text-base leading-7 font-scdream-medium mb-1" style={{ color: colors.text }}>
              {comments.productComment}
            </Text>
            {comments.scheduleComment && (
              <Text className="text-sm leading-6 text-gray-500">
                {comments.scheduleComment}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};
