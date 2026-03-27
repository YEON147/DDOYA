import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme/colors';

export interface SupplementTimingRecommendation {
  userSupplementId: number;
  alias: string;
  timings: {
    timingEnum: string;
    timingLabel: string;
    intakeTime: string;
  }[];
  isNew?: boolean;
}

interface TimeRecommendationProps {
  supplementRecommendations: SupplementTimingRecommendation[];
  onEditTime: (userSupplementId: number, timingEnum: string, initialTime: string) => void;
}

export const TimeRecommendation: React.FC<TimeRecommendationProps> = ({ supplementRecommendations, onEditTime }) => {
  return (
    <View className="mb-12">
      <View className="flex-row items-center mb-6">
        <View className="w-8 h-8 rounded-full bg-slate-700 items-center justify-center mr-3">
          <Ionicons name="time" size={18} color="white" />
        </View>
        <Text className="text-lg font-bold" style={{ color: colors.text }}>영양제별 복용 시점 설정</Text>
      </View>

      <View className="bg-slate-50 rounded-[36px] p-6 mb-4">
         {/* 추천 요약 섹션: 영양제 기준 */}
         <View className="bg-white rounded-3xl p-6 border border-slate-100 mb-8 shadow-sm">
            <Text className="text-[13px] font-scdream-bold text-slate-400 mb-4 ml-1">맞춤 복용 제안</Text>
            {supplementRecommendations.map((item, index) => (
              <View key={`summary-${index}`} className="mb-4 last:mb-0">
                <View className="flex-row items-center mb-1">
                  <View className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-2.5" />
                  <Text className="text-sm font-scdream-bold" style={{ color: colors.text }}>
                    {item.alias}
                  </Text>
                  {item.isNew && (
                    <View className="ml-2 px-1.5 py-0.5 bg-orange-50 rounded-md border border-orange-100">
                      <Text className="text-[8px] font-bold text-orange-500">NEW</Text>
                    </View>
                  )}
                </View>
                <Text className="text-[13px] text-slate-500 ml-4 font-scdream leading-5">
                  {item.timings.map(t => `${t.timingLabel} 추천`).join(', ')}
                </Text>
              </View>
            ))}
            <View className="mt-2 pt-4 border-t border-slate-50">
              <Text className="text-xs text-slate-400 leading-5">
                * 영양제별 특성을 고려한 최적의 시점입니다. 시점별 설정된 시간을 확인해 주세요.
              </Text>
            </View>
         </View>

         {/* 시간 수정 섹션: 영양제별 카드 형태 */}
         <Text className="text-[15px] font-scdream-bold mb-4 ml-2" style={{ color: colors.text }}>영양제별 시점 확인</Text>
         {supplementRecommendations.map((item) => (
           <View 
            key={item.userSupplementId}
            className="bg-white rounded-[24px] p-5 border border-slate-100 mb-4 shadow-sm"
           >
             <View className="flex-row items-center mb-3">
               <Text className="text-[16px] font-bold" style={{ color: colors.text }}>
                 {item.alias}
               </Text>
               {item.isNew && (
                 <View className="ml-2 px-2 py-0.5 bg-orange-100 rounded-lg">
                   <Text className="text-[10px] font-bold text-orange-600">NEW</Text>
                 </View>
               )}
             </View>
             
             {item.timings.map((t, idx) => (
               <View 
                key={`${item.userSupplementId}-${t.timingEnum}`}
                className={`flex-row items-center justify-between py-3 ${idx < item.timings.length - 1 ? 'border-b border-slate-50' : ''}`}
               >
                 <View className="flex-1">
                   <Text className="text-[14px] text-slate-600 font-scdream-medium">
                     {t.timingLabel} 추천
                   </Text>
                 </View>
                 
                 <TouchableOpacity 
                   onPress={() => onEditTime(item.userSupplementId, t.timingEnum, t.intakeTime)}
                   className="w-10 h-10 items-center justify-center rounded-xl"
                   style={{ backgroundColor: colors.surface }}
                   activeOpacity={0.7}
                 >
                    <Ionicons name="create-outline" size={18} color={colors.textMuted} />
                 </TouchableOpacity>
               </View>
             ))}
           </View>
         ))}
      </View>
    </View>
  );
};
