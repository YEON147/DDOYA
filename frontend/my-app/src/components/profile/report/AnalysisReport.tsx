import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '@/constants/theme/colors';
import { softWellnessCard } from '@/constants/theme/neumorphism';
import { ReportComments, IngredientAnalysis } from '@/src/types/report';
import { Ionicons } from '@expo/vector-icons';

interface AnalysisReportProps {
  comments: ReportComments | null;
  ingredientAnalysis?: IngredientAnalysis[];
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  comments,
  ingredientAnalysis = [],
}) => {
  if (!comments) return null;

  const normalizedItems = ingredientAnalysis
    .map((it) => ({
      name: it.normalized_ingredient_name || it.normalizedIngredientName || '성분',
      type: (it.analysis_type || it.analysisType || 'NORMAL') as 'EXCESS' | 'DEFICIENCY' | 'NORMAL',
    }))
    .slice(0, 6);
  const items = normalizedItems;

  return (
    <View className="mb-10">
      <View className="mb-4 flex-row items-center">
        <View className="mr-3 h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: '#262626' }}>
          <Ionicons name="star" size={14} color="#FFFFFF" />
        </View>
        <Text className="text-lg font-scdream-bold" style={{ color: colors.text }}>
          분석 리포트
        </Text>
      </View>

      <View className="gap-3">
        <View className="p-5" style={softWellnessCard(22)}>
          <Text className="mb-3 text-sm font-scdream-bold" style={{ color: colors.text }}>
            성분 상태
          </Text>
          <View className="mb-2 flex-row justify-between px-1">
            <Text className="text-xs font-scdream" style={{ color: colors.textMuted }}>부족</Text>
            <Text className="text-xs font-scdream" style={{ color: colors.textMuted }}>적정</Text>
            <Text className="text-xs font-scdream" style={{ color: colors.textMuted }}>과잉</Text>
          </View>

          {items.length === 0 ? (
            <Text className="py-1 text-sm font-scdream" style={{ color: colors.textMuted }}>
              성분 분석 데이터가 없어요.
            </Text>
          ) : (
            items.map((it, idx) => {
              const name = it.name;
              const type = it.type;
              const markerLeft = type === 'DEFICIENCY' ? '0%' : type === 'EXCESS' ? '100%' : '50%';
              const markerColor = type === 'DEFICIENCY' ? '#8B5CF6' : type === 'EXCESS' ? '#EF4444' : '#A3A39B';

              return (
                <View key={`${name}-${idx}`} className="mb-5 last:mb-0">
                  <View className="mb-1 flex-row items-center">
                    <Text className="text-sm font-scdream-medium" style={{ color: colors.text }}>
                      {name}
                    </Text>
                  </View>
                  <View className="h-5 justify-center">
                    <View className="h-[2px] rounded-full" style={{ backgroundColor: `${colors.shadowDark}4D` }} />
                    <View
                      className="absolute left-0 h-3 w-3 rounded-full border"
                      style={{ top: '50%', marginTop: -6, borderColor: `${colors.shadowDark}88`, backgroundColor: colors.cardIvory }}
                    />
                    <View
                      className="absolute h-3 w-3 rounded-full border"
                      style={{ left: '50%', top: '50%', marginLeft: -6, marginTop: -6, borderColor: `${colors.shadowDark}88`, backgroundColor: colors.cardIvory }}
                    />
                    <View
                      className="absolute right-0 h-3 w-3 rounded-full border"
                      style={{ top: '50%', marginTop: -6, borderColor: `${colors.shadowDark}88`, backgroundColor: colors.cardIvory }}
                    />
                    <View
                      className="absolute h-4 w-4 rounded-full border-2"
                      style={{
                        top: '50%',
                        left: markerLeft,
                        marginTop: -8,
                        marginLeft: markerLeft === '0%' ? 0 : markerLeft === '100%' ? -16 : -8,
                        borderColor: markerColor,
                        backgroundColor: colors.cardIvory,
                      }}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {(comments.excessComment || comments.deficiencyComment) && (
          <View className="p-5" style={softWellnessCard(22)}>
            <Text className="mb-3 text-sm font-scdream-bold" style={{ color: colors.text }}>
              섭취 상태 요약
            </Text>

            {comments.excessComment && (
              <View className="mb-3">
                <Text className="mb-1 text-xs font-scdream-bold" style={{ color: colors.primary }}>
                  과잉 섭취 주의
                </Text>
                <Text className="text-sm font-scdream leading-6" style={{ color: colors.textMuted }}>
                  {comments.excessComment}
                </Text>
              </View>
            )}

            {comments.deficiencyComment && (
              <View>
                <Text className="mb-1 text-xs font-scdream-bold" style={{ color: colors.brown }}>
                  부족 성분 보완
                </Text>
                <Text className="text-sm font-scdream leading-6" style={{ color: colors.textMuted }}>
                  {comments.deficiencyComment}
                </Text>
              </View>
            )}
          </View>
        )}

        {(comments.productComment || comments.scheduleComment) && (
          <View className="p-5" style={softWellnessCard(22)}>
            <Text className="mb-3 text-sm font-scdream-bold" style={{ color: colors.text }}>
              맞춤 제안
            </Text>
            {comments.productComment && (
              <Text className="mb-2 text-sm font-scdream leading-6" style={{ color: colors.textMuted }}>
                {comments.productComment}
              </Text>
            )}
            {comments.scheduleComment && (
              <Text className="text-sm font-scdream leading-6" style={{ color: colors.textMuted }}>
                {comments.scheduleComment}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};
