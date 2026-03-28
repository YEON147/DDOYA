import React from 'react';
import {
  View,
  Text,
  Image,
  useWindowDimensions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { colors } from '@/constants/theme/colors';
import { scaleByWidth } from '@/src/utils/responsive';

const REPORT_SQUIRREL = require('../../../../assets/images/DDOYA_report.png');

type SpeechBubbleProps = {
  title?: string;
  titleColor?: string;
  leadIn?: string;
  leadInTextStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** 리포트 말풍선 — 테두리 없음, 은은한 그림자만 */
function SpeechBubble({ title, titleColor, leadIn, leadInTextStyle, children, style }: SpeechBubbleProps) {
  const { width } = useWindowDimensions();
  const bubbleBg = `${colors.cardIvory}CC`;
  const ph = scaleByWidth(width, 18, { min: 14, max: 22 });
  const pv = scaleByWidth(width, 16, { min: 14, max: 22 });

  return (
    <View
      className="relative w-full rounded-3xl"
      style={[
        {
          alignSelf: 'stretch',
          backgroundColor: bubbleBg,
          paddingHorizontal: ph,
          paddingTop: pv,
          paddingBottom: scaleByWidth(width, 18, { min: 14, max: 22 }),
          shadowColor: colors.shadowDark,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 1,
        },
        style,
      ]}
    >
      <View
        style={{
          position: 'absolute',
          right: -scaleByWidth(width, 6, { min: 5, max: 8 }),
          bottom: scaleByWidth(width, 16, { min: 12, max: 22 }),
          width: scaleByWidth(width, 12, { min: 10, max: 14 }),
          height: scaleByWidth(width, 12, { min: 10, max: 14 }),
          backgroundColor: bubbleBg,
          transform: [{ rotate: '45deg' }],
        }}
      />
      {leadIn ? (
        <Text className="mb-2 text-base font-scdream" style={[{ color: colors.text }, leadInTextStyle]}>
          {leadIn}
        </Text>
      ) : null}
      {title ? (
        <Text
          className="mb-2 text-base font-scdream-bold"
          style={{ color: titleColor ?? colors.text, letterSpacing: -0.2 }}
        >
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

type GreetingBubbleWithSquirrelProps = {
  leadIn: string;
};

export function GreetingBubbleWithSquirrel({ leadIn }: GreetingBubbleWithSquirrelProps) {
  const { width } = useWindowDimensions();
  const imgW = scaleByWidth(width, 84, { min: 72, max: 100 });
  const imgH = scaleByWidth(width, 112, { min: 94, max: 128 });

  return (
    <View className="w-full flex-row items-center">
      <View
        className="min-w-0"
        style={{
          maxWidth: '76%',
          flexShrink: 1,
          transform: [{ translateY: -scaleByWidth(width, 8, { min: 4, max: 12 }) }],
        }}
      >
        <SpeechBubble
          leadIn={leadIn}
          leadInTextStyle={{
            lineHeight: scaleByWidth(width, 27, { min: 23, max: 31 }),
            paddingTop: 2,
            textAlign: 'center',
            alignSelf: 'stretch',
          }}
        />
      </View>
      <View className="min-w-0 flex-1" />
      <View style={{ flexShrink: 0 }}>
        <Image source={REPORT_SQUIRREL} style={{ width: imgW, height: imgH }} resizeMode="contain" />
      </View>
    </View>
  );
}

type ReportSquirrelCommentSectionProps = {
  children: React.ReactNode;
};

export function ReportSquirrelCommentSection({ children }: ReportSquirrelCommentSectionProps) {
  const items = React.Children.toArray(children).filter(Boolean);
  if (items.length === 0) return null;

  return (
    <View className="w-full">
      <View className="w-full gap-4">{items}</View>
    </View>
  );
}

export { SpeechBubble };
