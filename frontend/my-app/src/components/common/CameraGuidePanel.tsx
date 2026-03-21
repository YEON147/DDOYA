import React from 'react';
import { View, Text, TouchableOpacity, Image, type ImageSourcePropType, type ImageResizeMode } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';

type CameraGuidePanelProps = {
  stepLabel: string;
  description: string;
  buttonLabel: string;
  onPress: () => void;
  guideImageSource?: ImageSourcePropType;
  guideImageResizeMode?: ImageResizeMode;
};

export function CameraGuidePanel({
  stepLabel,
  description,
  buttonLabel,
  onPress,
  guideImageSource,
  guideImageResizeMode = 'cover',
}: CameraGuidePanelProps) {
  return (
    <View className="flex-1 items-center justify-center px-10" style={{ backgroundColor: colors.background }}>
      <View
        className="mb-6 w-full items-center justify-center overflow-hidden rounded-3xl"
        style={[neuRaised(24, colors.surface), { aspectRatio: 1 }]}
      >
        {guideImageSource ? (
          <Image source={guideImageSource} resizeMode={guideImageResizeMode} style={{ width: '100%', height: '100%' }} />
        ) : (
          <Ionicons name="camera-outline" size={60} color={colors.primary} />
        )}
      </View>
      <Text className="mb-2 text-2xl font-bold" style={{ color: colors.text }}>
        {stepLabel}
      </Text>
      <Text className="mb-8 text-center text-lg" style={{ color: colors.textMuted }}>
        {description}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        className="px-8 py-3.5"
        style={neuRaised(999, colors.point)}
      >
        <Text className="text-lg font-bold text-white">{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}
