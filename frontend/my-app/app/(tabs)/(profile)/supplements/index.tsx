import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSupplementStore } from '@/src/store/supplementStore';
import { colors } from '@/constants/theme/colors';

export default function SupplementsScreen() {
  const router = useRouter();
  const { supplements } = useSupplementStore();

  const renderItem = ({ item }: { item: any }) => (
    <View 
      className="flex-row items-center px-6 py-4 mb-2 mx-4 rounded-3xl shadow-sm"
      style={{ backgroundColor: colors.surface }}
    >
      <Image
        source={{ uri: item.image_url }}
        className="w-16 h-16 rounded-2xl"
        style={{ backgroundColor: colors.background }}
        resizeMode="cover"
      />
      <View className="flex-1 ml-4 py-1">
        <Text className="text-lg font-bold mb-1" style={{ color: colors.text }} numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-gray-500 text-sm mb-1">
          {item.primary_ingredient}
        </Text>
        <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
          재고: {item.stock_quantity}{item.unit || '정'}
        </Text>
      </View>
      <TouchableOpacity 
        onPress={() => router.push(`/supplements/${item.supplement_id}`)}
        className="px-4 py-2 rounded-full"
        style={{ backgroundColor: colors.background }}
      >
        <Text className="text-gray-400 text-sm font-bold">수정</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="px-6 py-6 flex-row justify-between items-center">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>새로운 영양제 등록하기</Text>
        <TouchableOpacity
          onPress={() => router.push('/supplements/create')}
          className="w-12 h-12 rounded-full items-center justify-center shadow-lg"
          style={{ backgroundColor: colors.primary }}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={supplements}
        keyExtractor={(item) => item.supplement_id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="text-gray-400">등록된 영양제가 없습니다.</Text>
          </View>
        }
        contentContainerClassName="pt-2 pb-10"
      />
    </View>
  );
}
