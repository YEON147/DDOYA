import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme/colors';
import { softWellnessCard } from '@/constants/theme/neumorphism';
import { ReportComments, IngredientAnalysis } from '@/src/types/report';

/** 성분 적정(정상) 활성 표시 */
const ADEQUATE_GREEN = '#2FB58A';
const STATUS_LED_COLORS = {
  DEFICIENCY: '#8B5CF6',
  NORMAL: ADEQUATE_GREEN,
  EXCESS: '#EF4444',
} as const;

const TRACK_ANCHOR = 6;
const TRACK_ANCHOR_HALF = TRACK_ANCHOR / 2;
const STATUS_LED_SIZE = 16;
const STATUS_LED_HALF = STATUS_LED_SIZE / 2;
const STATUS_LED_SHADOW = {
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.5,
  shadowRadius: 4,
  elevation: 4,
} as const;

/** 좌측 성분명 / 우측 상태바 — 트랙 비중↑·열 간격 좁혀 바를 길게 */
const STATUS_ROW = 'w-full flex-row items-stretch gap-1.5';
const STATUS_NAME_COL = 'min-w-0 flex-[5] shrink justify-center';
const STATUS_TRACK_COL = 'min-w-0 flex-[15] justify-center';
const STATUS_TABLE_ROW_DIVIDER = `${colors.shadowDark}45`;

/** 트랙 위 점(앵커·LED)과 동일한 가로 기준 — 범례 텍스트 중심을 이 축에 맞춤 */
const STATUS_TRACK_X = ['0%', '50%', '100%'] as const;

/** 범례: 각 축 위에 고정 폭 슬롯을 두고 가운데 정렬 → 점과 수직선상 정렬 */
const LEGEND_SLOT_W = 52;
const LEGEND_SLOT_HALF = LEGEND_SLOT_W / 2;

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
        <View>
          <Text className="mb-3 text-sm font-scdream-bold" style={{ color: colors.text }}>
            성분 상태
          </Text>

          {items.length === 0 ? (
            <Text className="py-1 text-sm font-scdream" style={{ color: colors.textMuted }}>
              성분 분석 데이터가 없어요.
            </Text>
          ) : (
            <>
              <View
                className={STATUS_ROW}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: STATUS_TABLE_ROW_DIVIDER,
                }}
              >
                <View className={`${STATUS_NAME_COL} justify-end pb-0.5`}>
                  <Text
                    className="text-[11px] font-scdream-bold tracking-wide"
                    style={{ color: colors.textMuted }}
                    numberOfLines={1}
                  >
                    성분
                  </Text>
                </View>
                <View className={STATUS_TRACK_COL}>
                  <View className="relative min-h-[18px] w-full px-0.5">
                    {(['부족', '적정', '과잉'] as const).map((label, i) => (
                      <View
                        key={label}
                        pointerEvents="none"
                        style={{
                          position: 'absolute',
                          left: STATUS_TRACK_X[i],
                          width: LEGEND_SLOT_W,
                          marginLeft: -LEGEND_SLOT_HALF,
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          className="text-[11px] font-scdream leading-4"
                          style={{ color: colors.textMuted, textAlign: 'center' }}
                          numberOfLines={1}
                        >
                          {label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {items.map((it, idx) => {
                const name = it.name;
                const type = it.type;
                const ledColor = STATUS_LED_COLORS[type] ?? STATUS_LED_COLORS.NORMAL;
                const ledLeft =
                  type === 'DEFICIENCY'
                    ? STATUS_TRACK_X[0]
                    : type === 'EXCESS'
                      ? STATUS_TRACK_X[2]
                      : STATUS_TRACK_X[1];

                const anchorStyle = {
                  position: 'absolute' as const,
                  width: TRACK_ANCHOR,
                  height: TRACK_ANCHOR,
                  borderRadius: TRACK_ANCHOR_HALF,
                  top: '50%' as const,
                  marginTop: -TRACK_ANCHOR_HALF,
                  backgroundColor: `${colors.shadowDark}50`,
                  borderWidth: 1,
                  borderColor: `${colors.shadowDark}70`,
                };

                return (
                  <View
                    key={`${name}-${idx}`}
                    className={STATUS_ROW}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      borderBottomWidth: idx < items.length - 1 ? StyleSheet.hairlineWidth : 0,
                      borderBottomColor: STATUS_TABLE_ROW_DIVIDER,
                    }}
                  >
                    <View className={STATUS_NAME_COL}>
                      <Text
                        className="text-left text-sm font-scdream-medium leading-[22px]"
                        style={{ color: colors.text }}
                        numberOfLines={2}
                      >
                        {name}
                      </Text>
                    </View>
                    <View className={STATUS_TRACK_COL}>
                      <View className="relative h-6 w-full justify-center px-0.5">
                        <View
                          className="h-[2px] rounded-full"
                          style={{ backgroundColor: `${colors.shadowDark}55` }}
                        />
                        {STATUS_TRACK_X.map((x) => (
                          <View
                            key={x}
                            style={[anchorStyle, { left: x, marginLeft: -TRACK_ANCHOR_HALF }]}
                          />
                        ))}
                        <View
                          className="absolute rounded-full border-2"
                          style={{
                            width: STATUS_LED_SIZE,
                            height: STATUS_LED_SIZE,
                            top: '50%',
                            left: ledLeft,
                            marginTop: -STATUS_LED_HALF,
                            marginLeft: -STATUS_LED_HALF,
                            borderColor: ledColor,
                            backgroundColor: ledColor,
                            shadowColor: ledColor,
                            ...STATUS_LED_SHADOW,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </>
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
