import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/theme/colors';
import { RecommendedProduct } from '@/src/types/report';
import { Ionicons } from '@expo/vector-icons';

interface ProductRecommendationProps {
  nickname: string;
  products: RecommendedProduct[];
}

export const ProductRecommendation: React.FC<ProductRecommendationProps> = ({ nickname, products }) => {
  if (!products || products.length === 0) {
    return (
      <View className="mb-10 p-8 rounded-[32px] bg-gray-50 items-center justify-center border border-dashed border-gray-200">
        <Ionicons name="basket-outline" size={32} color={colors.textMuted} className="mb-2" />
        <Text className="text-sm text-gray-400 font-scdream text-center">
          현재 분석 결과에 따른{"\n"}추천 제품이 없어요.
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-10">
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-lg font-bold" style={{ color: colors.text }}>
          {nickname}님을 위한 맞춤 제품
        </Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
        className="overflow-visible"
      >
        {products.slice(0, 5).map((product) => (
          <TouchableOpacity 
            key={product.productCode}
            className="mr-4 p-4 rounded-[28px] bg-white border border-gray-100 shadow-sm"
            style={{ width: 170 }}
            activeOpacity={0.85}
          >
            {/* 제품 이미지 영역 */}
            <View className="items-center justify-center bg-gray-50 rounded-2xl p-4 aspect-square mb-4">
              <Image 
                source={{ uri: product.pillImageUrl || 'https://via.placeholder.com/150' }}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>

            {/* 제품 정보 영역 */}
            <View className="px-1">
              <Text className="text-[14px] font-scdream-bold mb-1" style={{ color: colors.text }} numberOfLines={1}>
                {product.productName}
              </Text>
              
              <View className="flex-row items-center">
                <View className="px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100 mr-2">
                  <Text className="text-[10px] font-scdream-medium text-orange-500">추천</Text>
                </View>
                {product.brand && (
                  <Text className="text-[11px] font-scdream text-gray-400 flex-1" numberOfLines={1}>
                    {product.brand}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {/* 더 보기 또는 마지막 여백을 위한 뷰 */}
        <View style={{ width: 10 }} />
      </ScrollView>
    </View>
  );
};
