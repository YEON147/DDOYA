import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme/colors';
import { ReportDecorAcornImage } from '@/src/constants/reportDecorAcorn';
import { ReportComments, IngredientAnalysis } from '@/src/types/report';
import {
  GreetingBubbleWithSquirrel,
  ReportSquirrelCommentSection,
  SpeechBubble,
} from '@/src/components/profile/report/ReportSquirrelSpeech';

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

const STATUS_ROW = 'w-full flex-row items-stretch gap-1.5';
const STATUS_NAME_COL = 'min-w-0 flex-[5] shrink justify-center';
const STATUS_TRACK_COL = 'min-w-0 flex-[15] justify-center';
const STATUS_DIVIDER = `${colors.shadowDark}33`;

const STATUS_TRACK_X = ['0%', '50%', '100%'] as const;
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

  const hasSpeechBlock =
    !!comments.excessComment ||
    !!comments.deficiencyComment ||
    !!comments.productComment ||
    !!comments.scheduleComment;

  return (
    <View className="mb-2">
      <View className="mb-8 flex-row items-center">
        <Text
          className="shrink text-2xl font-scdream-bold"
          style={{ color: colors.text }}
          numberOfLines={1}
        >
          영양 분석 리포트
        </Text>
        <View
          className="ml-3 min-h-0 flex-1"
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: STATUS_DIVIDER,
          }}
        />
      </View>

      <View className="gap-8">
        <View>
            <View className="mb-3 flex-row items-center">
              <View className="mr-2 justify-center" style={{ transform: [{ translateY: -2 }] }}>
                <ReportDecorAcornImage size={22} />
              </View>
              <Text className="text-lg font-scdream-bold" style={{ color: colors.text }}>
                성분 상태
              </Text>
            </View>

            {items.length === 0 ? (
              <Text className="py-1 text-sm font-scdream leading-5" style={{ color: colors.textMuted }}>
                성분 분석 데이터가 없어요.
              </Text>
            ) : (
              <View className="rounded-2xl" style={{ backgroundColor: `${colors.surface}99` }}>
                <View
                  className={STATUS_ROW}
                  style={{
                    paddingHorizontal: 12,
                    paddingTop: 10,
                    paddingBottom: 8,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: STATUS_DIVIDER,
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
                        paddingHorizontal: 12,
                        paddingVertical: 11,
                        borderBottomWidth: idx < items.length - 1 ? StyleSheet.hairlineWidth : 0,
                        borderBottomColor: STATUS_DIVIDER,
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
                            style={{ backgroundColor: `${colors.shadowDark}50` }}
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
              </View>
            )}
        </View>

        {hasSpeechBlock ? (
              <ReportSquirrelCommentSection>
                {(comments.excessComment || comments.deficiencyComment) && (
                  <GreetingBubbleWithSquirrel leadIn={'DDOYA와 함께\n섭취상태를 확인해볼까요 !'} />
                )}
                {comments.excessComment ? (
                  <SpeechBubble title="과잉 섭취 주의" titleColor={STATUS_LED_COLORS.EXCESS}>
                    <Text className="text-base font-scdream leading-7" style={{ color: colors.textMuted }}>
                      {comments.excessComment}
                    </Text>
                  </SpeechBubble>
                ) : null}
                {comments.deficiencyComment ? (
                  <SpeechBubble title="부족 성분 보완" titleColor={STATUS_LED_COLORS.DEFICIENCY}>
                    <Text className="text-base font-scdream leading-7" style={{ color: colors.textMuted }}>
                      {comments.deficiencyComment}
                    </Text>
                  </SpeechBubble>
                ) : null}

                {(comments.productComment || comments.scheduleComment) &&
                (comments.excessComment || comments.deficiencyComment) ? (
                  <SpeechBubble leadIn="그리고 참고하면 좋을 만한 제안도 적어 뒀어요." />
                ) : null}
                {(comments.productComment || comments.scheduleComment) &&
                !(comments.excessComment || comments.deficiencyComment) ? (
                  <SpeechBubble leadIn="참고하면 좋을 만한 제안을 적어 뒀어요." />
                ) : null}
                {comments.scheduleComment ? (
                  <SpeechBubble title="섭취 루틴">
                    <Text className="text-base font-scdream leading-7" style={{ color: colors.textMuted }}>
                      {comments.scheduleComment}
                    </Text>
                  </SpeechBubble>
                ) : null}
                {comments.productComment ? (
                  <SpeechBubble title="제품·선택">
                    <Text className="text-base font-scdream leading-7" style={{ color: colors.textMuted }}>
                      {comments.productComment}
                    </Text>
                  </SpeechBubble>
                ) : null}
              </ReportSquirrelCommentSection>
        ) : null}
      </View>
    </View>
  );
};
