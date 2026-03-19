import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSupplementStore } from '@/src/store/supplementStore';
import { colors } from '@/constants/theme/colors';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
// import { supplementApi } from '@/src/api/supplement';


export default function SupplementsScreen() {
  const router = useRouter();
  const { supplements } = useSupplementStore();
  // const [supplements, setSupplements] = useState<any[]>([]);

  // 백 api 연동
  // const getSupplements = async () => {
  //   const res = await supplementApi.getSupplements(1, 10);
  //   setSupplements(res.data.data);
  // }
  // useEffect(() => {
  //   getSupplements();
  // }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View
      className="flex-row items-center p-4"
      >
      <Image
        source={{ uri: item.image_url }}
        className="w-20 h-20 rounded-2xl ml-4"
        style={{ backgroundColor: colors.point }}
        resizeMode="cover"
      />
      <View className="flex-1 my-4 mx-8">
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
    <ScreenContainer
      scrollable={false}
      padding={0}
      header={
        <TopHeader
          title="영양제 관리"
          right={
            <TouchableOpacity
              onPress={() => router.push('/supplements/create')}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Ionicons name="add" size={22} color="white" />
            </TouchableOpacity>
          }
        />
      }
    >

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
    </ScreenContainer>
  );
}
