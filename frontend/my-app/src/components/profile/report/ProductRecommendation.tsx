import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/theme/colors';
import { ReportDecorAcornImage } from '@/src/constants/reportDecorAcorn';
import { RecommendedProduct } from '@/src/types/report';
import { Ionicons } from '@expo/vector-icons';
import { softWellnessCard } from '@/constants/theme/neumorphism';

interface ProductRecommendationProps {
  nickname: string;
  products: RecommendedProduct[];
}

export const ProductRecommendation: React.FC<ProductRecommendationProps> = ({ nickname, products }) => {
  if (!products || products.length === 0) {
    return (
      <View
        className="mb-10 mt-8 items-center justify-center p-8"
        style={[softWellnessCard(28), { borderStyle: 'dashed', borderColor: `${colors.shadowDark}35` }]}
      >
        <Ionicons name="basket-outline" size={32} color={colors.textMuted} className="mb-2" />
        <Text className="text-center text-sm font-scdream" style={{ color: colors.textMuted }}>
          현재 분석 결과에 따른{"\n"}추천 제품이 없어요.
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-10 mt-8">
      <View className="mb-5 flex-row items-center justify-between">
        <View className="min-w-0 flex-1 flex-row items-center">
          <View className="mr-2 justify-center" style={{ transform: [{ translateY: -2 }] }}>
            <ReportDecorAcornImage size={22} />
          </View>
          <Text
            className="flex-1 text-lg font-scdream-bold"
            style={{ color: colors.text }}
            numberOfLines={2}
          >
            {nickname}님을 위한 맞춤 제품
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap justify-between">
        {products.slice(0, 4).map((product, idx) => (
          <TouchableOpacity
            key={`${product.productCode}-${idx}`}
            className="mb-3 p-4"
            style={[softWellnessCard(20), { width: '48.5%' }]}
            activeOpacity={0.85}
          >
            <View className="mb-3 aspect-square items-center justify-center rounded-2xl p-4" style={{ backgroundColor: colors.surface }}>
              <Image
                source={{ uri: product.pillImageUrl || 'https://via.placeholder.com/150' }}
                className="h-full w-full"
                resizeMode="contain"
              />
            </View>

            <View className="px-0.5">
              <Text className="mb-2 text-[14px] font-scdream-bold" style={{ color: colors.text }} numberOfLines={2}>
                {product.productName}
              </Text>

              <View className="self-start rounded-full px-2 py-0.5" style={{ backgroundColor: `${colors.primary}12`, borderWidth: 1, borderColor: `${colors.primary}26` }}>
                <Text className="text-[10px] font-scdream-medium" style={{ color: colors.primary }}>추천</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
