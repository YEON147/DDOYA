import type { ReactNode } from 'react';
import { Image, Platform, Text, TouchableOpacity, View, type ImageResizeMode, type ImageSourcePropType } from 'react-native';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';

export type CaptureGuideScreenLayoutProps = {
  /** 가이드 이미지 위 좌측 상단 오버레이 라벨 (예: STEP 1, 촬영 가이드) */
  guideLabel: string;
  guideImageSource: ImageSourcePropType;
  guideImageResizeMode?: ImageResizeMode;
  /** 주황 버튼 위 안내 문구 */
  instructionText: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  /** 웹 전용 보조 문구 (없으면 미표시) */
  webNote?: string;
  /** 숨김 카메라 등 상단 오버레이 (섭취 인증 촬영 등) */
  topOverlay?: ReactNode;
};

/**
 * 섭취 인증 촬영 / 영양제 등록 가이드 등 동일한 1:1 가이드 + 하단 버튼 레이아웃
 */
export function CaptureGuideScreenLayout({
  guideLabel,
  guideImageSource,
  guideImageResizeMode = 'contain',
  instructionText,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  webNote,
  topOverlay,
}: CaptureGuideScreenLayoutProps) {
  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {topOverlay}

      <View className="flex-1 justify-center px-6" style={{ minHeight: 0 }}>
        <View
          className="w-full max-w-[360px] self-center overflow-hidden rounded-3xl"
          style={[neuRaised(24, colors.surface), { aspectRatio: 1 }]}
        >
          <Image
            source={guideImageSource}
            resizeMode={guideImageResizeMode}
            style={{ width: '100%', height: '100%' }}
          />
          <View
            pointerEvents="none"
            className="absolute left-3 top-3 z-10 max-w-[88%] rounded-lg px-2.5 py-1.5"
            style={{ backgroundColor: 'rgba(42, 42, 40, 0.58)' }}
          >
            <Text className="text-base font-scdream leading-snug" style={{ color: '#FCFBF8' }} numberOfLines={3}>
              {guideLabel}
            </Text>
          </View>
        </View>
        {Platform.OS === 'web' && webNote ? (
          <Text className="mt-3 text-center text-base font-scdream" style={{ color: colors.textMuted }}>
            {webNote}
          </Text>
        ) : null}
      </View>

      <View className="px-6 pb-8 pt-4">
        <Text className="mb-4 text-center font-scdream" style={{ color: colors.textMuted }}>
          {instructionText}
        </Text>
        <TouchableOpacity
          onPress={onPrimary}
          activeOpacity={0.9}
          className="items-center px-6 py-3"
          style={neuRaised(999, colors.point)}
        >
          <Text className="font-semibold text-white">{primaryLabel}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onSecondary}
        activeOpacity={0.9}
        className="mx-6 mb-8 items-center px-6 py-3"
        style={neuRaised(999, colors.surface)}
      >
        <Text className="font-semibold" style={{ color: colors.text }}>
          {secondaryLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
