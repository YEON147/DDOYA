import React from 'react';
import { View, Text, StyleSheet, type TextStyle } from 'react-native';
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

/** API camelCase / snake_case / JSON 문자열 대응 */
function normalizeReportComments(raw: unknown): {
  excessComment: string;
  deficiencyComment: string;
  productComment: string;
  scheduleComment: string;
} {
  const empty = {
    excessComment: '',
    deficiencyComment: '',
    productComment: '',
    scheduleComment: '',
  };
  if (raw == null) return empty;

  let o: Record<string, unknown>;
  if (typeof raw === 'string') {
    try {
      o = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return empty;
    }
  } else if (typeof raw === 'object') {
    o = raw as Record<string, unknown>;
  } else {
    return empty;
  }

  const str = (camel: string, snake: string) => {
    const v = o[camel] ?? o[snake];
    return typeof v === 'string' ? v : '';
  };

  return {
    excessComment: str('excessComment', 'excess_comment'),
    deficiencyComment: str('deficiencyComment', 'deficiency_comment'),
    productComment: str('productComment', 'product_comment'),
    scheduleComment: str('scheduleComment', 'schedule_comment'),
  };
}

/**
 * 서버 문자열을 `**굵게**` 파서용으로 정리.
 * - 마크다운 구분자(`**…**` 또는 `__…__`)가 없으면 볼드/밑줄 구간이 생기지 않음(전부 일반 문장).
 */
function normalizeReportCommentSource(text: string): string {
  let s = text
    .replace(/\uFF0A/g, '*')
    .replace(/\u2217/g, '*')
    .replace(/\u204E/g, '*')
    .replace(/\uFE61/g, '*');
  // 일부 생성기는 `__텍스트__` 볼드 사용 → `**`로 통일
  s = s.replace(/__([\s\S]+?)__/g, '**$1**');
  return s;
}

/** 일반 구간 — 부모 Text에 font를 두지 않기 위해 동일 스타일 명시 */
const REPORT_PLAIN_TEXT: TextStyle = {
  color: colors.textMuted,
  fontSize: 16,
  lineHeight: 28,
  /** `useFonts`에 등록된 패밀리명과 일치해야 함 (SCoreDream4 아님) */
  fontFamily: 'SCoreDreamRegular',
};

/** `#RRGGBB`를 흰색 쪽으로 섞어 강조색을 한 톤 연하게 (0~1, 클수록 더 연함) */
function blendHexTowardWhite(hex: string, t: number): string {
  const h = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * t);
  return `#${[mix(r), mix(g), mix(b)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')}`;
}

/** `**굵게**`: 포인트색을 연한 톤으로 + ExtraBold */
function reportBoldEmphasisStyle(strongColor: string): TextStyle {
  return {
    color: blendHexTowardWhite(strongColor, 0.3),
    fontSize: 16,
    lineHeight: 28,
    fontFamily: 'SCoreDreamExtraBold',
  };
}

/** `**굵게**` — 토막마다 `<Text>`로 감싸 폰트·색이 먹게 함 */
function renderInlineBoldSegments(
  paragraph: string,
  strongColor: string,
  keyPrefix: string,
): React.ReactNode[] {
  const boldStyle = reportBoldEmphasisStyle(strongColor);
  const parts: React.ReactNode[] = [];
  const re = /\*\*([\s\S]+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let pi = 0;
  let si = 0;
  while ((m = re.exec(paragraph)) !== null) {
    if (m.index > last) {
      const plain = paragraph.slice(last, m.index);
      if (plain.length > 0) {
        parts.push(
          <Text key={`${keyPrefix}-p${pi++}`} style={REPORT_PLAIN_TEXT}>
            {plain}
          </Text>,
        );
      }
    }
    parts.push(
      <Text key={`${keyPrefix}-s${si++}`} style={boldStyle}>
        {m[1]}
      </Text>,
    );
    last = re.lastIndex;
  }
  if (last < paragraph.length) {
    const tail = paragraph.slice(last);
    if (tail.length > 0) {
      parts.push(
        <Text key={`${keyPrefix}-t`} style={REPORT_PLAIN_TEXT}>
          {tail}
        </Text>,
      );
    }
  }
  return parts.length > 0 ? parts : [<Text key={`${keyPrefix}-all`} style={REPORT_PLAIN_TEXT}>{paragraph}</Text>];
}

/** `\n\n` 문단 구분 + 단일 `\n` 줄바꿈 유지 */
function ReportCommentMarkdown({ markdown, strongColor }: { markdown: string; strongColor: string }) {
  const source = normalizeReportCommentSource(markdown.trim());
  if (!source) return null;

  const blocks = source.split(/\n\n+/).map((p) => p.trimEnd());
  const paragraphs = blocks.some((b) => b.length > 0) ? blocks.filter((b) => b.length > 0) : [];

  if (paragraphs.length === 0) return null;

  return (
    <View>
      {paragraphs.map((para, idx) => (
        <Text
          key={`rp-${idx}`}
          style={idx < paragraphs.length - 1 ? { marginBottom: 10 } : undefined}
        >
          {renderInlineBoldSegments(para, strongColor, `rp-${idx}`)}
        </Text>
      ))}
    </View>
  );
}

interface AnalysisReportProps {
  comments: ReportComments | null | undefined;
  ingredientAnalysis?: IngredientAnalysis[];
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  comments,
  ingredientAnalysis = [],
}) => {
  const c = normalizeReportComments(comments);

  const normalizedItems = ingredientAnalysis
    .map((it) => ({
      name: it.normalized_ingredient_name || it.normalizedIngredientName || '성분',
      type: (it.analysis_type || it.analysisType || 'NORMAL') as 'EXCESS' | 'DEFICIENCY' | 'NORMAL',
    }))
    .slice(0, 6);
  const items = normalizedItems;

  const hasSpeechBlock =
    !!c.excessComment.trim() ||
    !!c.deficiencyComment.trim() ||
    !!c.productComment.trim() ||
    !!c.scheduleComment.trim();

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
            {(c.excessComment.trim() || c.deficiencyComment.trim()) && (
              <GreetingBubbleWithSquirrel leadIn={'DDOYA와 함께\n섭취상태를 확인해볼까요 !'} />
            )}
            {c.excessComment.trim() ? (
              <SpeechBubble title="과잉 섭취 주의">
                <ReportCommentMarkdown markdown={c.excessComment} strongColor={STATUS_LED_COLORS.EXCESS} />
              </SpeechBubble>
            ) : null}
            {c.deficiencyComment.trim() ? (
              <SpeechBubble title="부족 성분 보완">
                <ReportCommentMarkdown markdown={c.deficiencyComment} strongColor={STATUS_LED_COLORS.DEFICIENCY} />
              </SpeechBubble>
            ) : null}

            {(c.productComment.trim() || c.scheduleComment.trim()) &&
            (c.excessComment.trim() || c.deficiencyComment.trim()) ? (
              <SpeechBubble leadIn="그리고 참고하면 좋을 만한 제안도 적어 뒀어요." />
            ) : null}
            {(c.productComment.trim() || c.scheduleComment.trim()) &&
            !(c.excessComment.trim() || c.deficiencyComment.trim()) ? (
              <SpeechBubble leadIn="참고하면 좋을 만한 제안을 적어 뒀어요." />
            ) : null}
            {c.scheduleComment.trim() ? (
              <SpeechBubble title="섭취 루틴">
                <ReportCommentMarkdown markdown={c.scheduleComment} strongColor={colors.pointMint} />
              </SpeechBubble>
            ) : null}
            {c.productComment.trim() ? (
              <SpeechBubble title="제품·선택">
                <ReportCommentMarkdown markdown={c.productComment} strongColor={colors.pointMint} />
              </SpeechBubble>
            ) : null}
          </ReportSquirrelCommentSection>
        ) : null}
      </View>
    </View>
  );
};
