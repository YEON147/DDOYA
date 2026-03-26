import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme/colors';

export interface RecommendationItem {
  userSupplementId: number;
  name: string;
  recommendedIntakeTime: string;
  reason?: string;
}

interface TimeRecommendationProps {
  recommendations: RecommendationItem[];
  onEditTime: (userSupplementId: number, initialTime: string) => void;
}

export const TimeRecommendation: React.FC<TimeRecommendationProps> = ({ recommendations, onEditTime }) => {
  return (
    <View className="mb-12">
      <View className="flex-row items-center mb-6">
        <View className="w-8 h-8 rounded-full bg-slate-700 items-center justify-center mr-3">
          <Ionicons name="time" size={18} color="white" />
        </View>
        <Text className="text-lg font-bold" style={{ color: colors.text }}>복용 시간 개인화 추천</Text>
      </View>

      <View className="bg-slate-50 rounded-[36px] p-6 mb-4">
         {/* 추천 요약 텍스트 섹션 */}
         <View className="bg-white rounded-3xl p-6 border border-slate-100 mb-8 shadow-sm">
            <Text className="text-[13px] font-scdream-bold text-slate-400 mb-3 ml-1">맞춤 복용 제안</Text>
            {recommendations.map((rec, index) => {
              const [hour, minute] = rec.recommendedIntakeTime.split(':');
              const displayHour = parseInt(hour, 10);
              const ampm = displayHour >= 12 ? '오후' : '오전';
              const cleanHour = displayHour > 12 ? displayHour - 12 : displayHour === 0 ? 12 : displayHour;
              
              return (
                <View key={`summary-${index}`} className="flex-row items-center mb-2 last:mb-0">
                  <View className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-3" />
                  <Text className="text-sm leading-6" style={{ color: colors.text }}>
                    {ampm} {cleanHour}시 {minute}분 <Text className="font-scdream-bold">{rec.name}</Text>
                  </Text>
                </View>
              );
            })}
            <View className="mt-4 pt-4 border-t border-slate-50">
              <Text className="text-xs text-slate-400 leading-5">
                * 영양제 간 상호작용과 흡수율을 고려한 최적의 시간대입니다. 아래에서 시간을 최종 확인해 주세요.
              </Text>
            </View>
         </View>

         {/* 시간 수정 인터랙티브 섹션 */}
         <Text className="text-[15px] font-scdream-bold mb-4 ml-2" style={{ color: colors.text }}>시간 직접 설정</Text>
         {recommendations.map((rec) => (
           <View 
            key={rec.userSupplementId}
            className="flex-row items-center justify-between bg-white rounded-[24px] p-5 border border-slate-100 mb-3 shadow-sm"
           >
             <View className="flex-1 mr-4">
               <Text className="text-[15px] font-bold mb-1" style={{ color: colors.text }} numberOfLines={1}>
                 {rec.name}
               </Text>
               {rec.reason && (
                 <Text className="text-[11px] text-gray-400 font-scdream" numberOfLines={1}>
                   {rec.reason}
                 </Text>
               )}
             </View>
             
             <TouchableOpacity 
               onPress={() => onEditTime(rec.userSupplementId, rec.recommendedIntakeTime)}
               className="flex-row items-center bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100"
               activeOpacity={0.7}
             >
                <Text className="text-[16px] font-scdream-bold mr-2" style={{ color: colors.text }}>
                  {rec.recommendedIntakeTime}
                </Text>
                <Ionicons name="create-outline" size={16} color={colors.textMuted} />
             </TouchableOpacity>
           </View>
         ))}
      </View>
    </View>
  );
};
