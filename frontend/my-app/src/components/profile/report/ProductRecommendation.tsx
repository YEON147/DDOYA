import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/theme/colors';
import { RecommendedProduct } from '@/src/types/report';

interface ProductRecommendationProps {
  nickname: string;
  products: RecommendedProduct[];
}

export const ProductRecommendation: React.FC<ProductRecommendationProps> = ({ nickname, products }) => {
  return (
    <View className="mb-8">
      <Text className="text-base font-medium mb-4" style={{ color: colors.text }}>
        {nickname}님 추천 제품이에요!
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {products.map((product) => (
          <TouchableOpacity 
            key={product.productId}
            className="mr-4 p-4 rounded-3xl bg-[#FFFBF0] border border-[#F0EAD6]"
            style={{ width: 140 }}
            activeOpacity={0.7}
          >
            <Text className="text-sm font-bold mb-3" style={{ color: colors.text }} numberOfLines={1}>
              {product.name}
            </Text>
            <View className="items-center justify-center bg-white rounded-2xl p-4 aspect-square mb-2">
              <Image 
                source={{ uri: product.pillImageUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' }}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>
            {product.brand && (
              <Text className="text-xs text-gray-400" numberOfLines={1}>
                {product.brand}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
