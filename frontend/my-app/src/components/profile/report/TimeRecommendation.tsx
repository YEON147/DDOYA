import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme/colors';
import { IntakeTimeRecommendation } from '@/src/types/report';

interface TimeRecommendationProps {
  recommendations: IntakeTimeRecommendation[];
  onEditTime: (userSupplementId: number, initialTime: string) => void;
}

export const TimeRecommendation: React.FC<TimeRecommendationProps> = ({ recommendations, onEditTime }) => {
  return (
    <View className="mb-12">
      <View className="flex-row items-center mb-6">
        <View className="w-8 h-8 rounded-full bg-[#3F4E65] items-center justify-center mr-2">
          <Ionicons name="time-outline" size={20} color="white" />
        </View>
        <Text className="text-lg font-bold" style={{ color: colors.text }}>복용 시간 추천</Text>
      </View>

      <View className="bg-gray-50 rounded-[32px] p-6 mb-4">
         {/* 요약 텍스트 박스 */}
         <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
            {recommendations.map((rec, index) => (
              <Text key={`summary-${index}`} className="text-sm mb-1" style={{ color: colors.text }}>
                {rec.recommendedIntakeTime.split(':')[0].replace(/^0/, '')}시 {rec.recommendedIntakeTime.split(':')[1]}분: {rec.name}
              </Text>
            ))}
         </View>

         {/* 개별 카드 */}
         {recommendations.map((rec) => (
           <View 
            key={rec.userSupplementId}
            className="flex-row items-center justify-between bg-white rounded-3xl p-5 border border-gray-100 mb-3 shadow-sm"
           >
             <Text className="text-base font-bold" style={{ color: colors.text }}>{rec.name}</Text>
             
             <View className="flex-row items-center">
                <Text className="text-lg font-bold mr-4" style={{ color: colors.text }}>
                  {rec.recommendedIntakeTime}
                </Text>
                <TouchableOpacity 
                  onPress={() => onEditTime(rec.userSupplementId, rec.recommendedIntakeTime)}
                  className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center border border-gray-100"
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </TouchableOpacity>
             </View>
           </View>
         ))}
      </View>
    </View>
  );
};
