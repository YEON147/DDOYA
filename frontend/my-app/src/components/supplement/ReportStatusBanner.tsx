import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';

interface ReportStatusBannerProps {
  onPress: () => void;
}

export const ReportStatusBanner: React.FC<ReportStatusBannerProps> = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        className="flex-row items-center justify-between px-6 py-4 rounded-[40px]"
        style={neuRaised(40, colors.primary)}
      >
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
            <Ionicons name="sparkles" size={16} color="white" />
          </View>
          <View>
            <Text className="text-white font-scdream-bold text-[15px]">영양제 정보가 변경되었습니다</Text>
            <Text className="text-white/80 font-scdream text-[12px]">새로운 전문가 분석 리포트 보러가기</Text>
          </View>
        </View>
        
        <View className="ml-2 bg-white/20 rounded-full p-2">
          <Ionicons name="arrow-forward" size={18} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    zIndex: 100,
  },
});
