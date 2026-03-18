import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SupplementCreateScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">영양제 등록</Text>
      </View>

      <View className="flex-1 items-center justify-center px-10">
        <View className="bg-blue-50 p-6 rounded-full mb-6">
          <Ionicons name="construct-outline" size={60} color="#3b82f6" />
        </View>
        <Text className="text-2xl font-bold text-gray-800 mb-2">준비 중인 페이지입니다</Text>
        <Text className="text-gray-500 text-center text-lg mb-8">
          조금만 기다려 주세요! 곧 더 좋은 기능으로 찾아뵙겠습니다.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-500 px-8 py-3 rounded-full shadow-md"
        >
          <Text className="text-white font-bold text-lg">돌아가기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
