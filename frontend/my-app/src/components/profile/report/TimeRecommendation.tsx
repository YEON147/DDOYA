import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme/colors';
import { softWellnessCard } from '@/constants/theme/neumorphism';

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
      <View className="mb-6 flex-row items-center">
        <View className="mr-3 h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.brown}D9` }}>
          <Ionicons name="time" size={18} color="white" />
        </View>
        <Text className="text-lg font-scdream-bold" style={{ color: colors.text }}>영양제별 복용 시점 설정</Text>
      </View>

      <View className="mb-4 p-5" style={softWellnessCard(24)}>
        <Text className="mb-2 text-xs font-scdream-bold" style={{ color: colors.textMuted }}>
          안내
        </Text>
        <Text className="text-sm font-scdream leading-6" style={{ color: colors.textMuted }}>
          영양제별 복용 시점과 시간을 확인하고, 필요하면 오른쪽 편집 버튼으로 시간을 수정해 주세요.
        </Text>
      </View>

      {supplementRecommendations.map((item) => (
        <View
          key={item.userSupplementId}
          className="mb-4 p-5"
          style={softWellnessCard(24)}
        >
          <View className="mb-3 flex-row items-center">
            <Text className="text-[16px] font-scdream-bold" style={{ color: colors.text }}>
              {item.alias}
            </Text>
            {item.isNew && (
              <View className="ml-2 rounded-lg px-2 py-0.5" style={{ backgroundColor: `${colors.primary}1A` }}>
                <Text className="text-[10px] font-scdream-bold" style={{ color: colors.primary }}>NEW</Text>
              </View>
            )}
          </View>

          {item.timings.map((t, idx) => (
            <View
              key={`${item.userSupplementId}-${t.timingEnum}`}
              className={`flex-row items-center justify-between py-3 ${idx < item.timings.length - 1 ? 'border-b' : ''}`}
              style={idx < item.timings.length - 1 ? { borderColor: `${colors.shadowDark}18` } : undefined}
            >
              <View className="flex-1 pr-2">
                <Text className="text-[13px] font-scdream" style={{ color: colors.textMuted }}>
                  {t.timingLabel}
                </Text>
                <Text className="mt-1 text-[15px] font-scdream-bold" style={{ color: colors.text }}>
                  {t.intakeTime}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => onEditTime(item.userSupplementId, t.timingEnum, t.intakeTime)}
                className="h-10 w-10 items-center justify-center rounded-xl"
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
  );
};
