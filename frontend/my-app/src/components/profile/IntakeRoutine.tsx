import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/theme/colors';

export function IntakeRoutine() {
  return (
    <View className="px-6 py-8">
      <View className="flex-row items-center justify-between mb-4">
        <Text
          className="text-lg font-scdream"
          style={{ color: colors.text }}
        >
          섭취 루틴
        </Text>
        <TouchableOpacity>
          <Text
            className="font-scdream text-sm"
            style={{ color: colors.text }}
          >
            수정
          </Text>
        </TouchableOpacity>
      </View>

      <View
        className="rounded-2xl p-5 shadow-sm border"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border
        }}
      >
        <View className="flex-row items-center mb-4">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: colors.background }}
          >
            <Text className="font-scdream">☀️</Text>
          </View>
          <View>
            <Text
              className="text-sm font-scdream"
              style={{ color: colors.text }}
            >
              아침 식후
            </Text>
            <Text
              className="text-base font-scdream"
              style={{ color: colors.text }}
            >
              08:30
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: colors.background }}
          >
            <Text className="font-scdream">🌙</Text>
          </View>
          <View>
            <Text
              className="text-sm font-scdream"
              style={{ color: colors.text }}
            >
              취침 전
            </Text>
            <Text
              className="text-base font-scdream"
              style={{ color: colors.text }}
            >
              23:00
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
