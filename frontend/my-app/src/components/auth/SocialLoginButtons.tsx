import { View, Text, TouchableOpacity } from 'react-native';

export function SocialLoginButtons() {
  return (
    <View className="mt-1">
      <View className="flex-row justify-center gap-6">
        {/* Naver */}
        <TouchableOpacity className="w-16 h-16 rounded-full bg-[#03C75A] items-center justify-center">
          <Text className="text-white font-scdream text-3xl">N</Text>
        </TouchableOpacity>
        {/* Kakao */}
        <TouchableOpacity className="w-16 h-16 rounded-full bg-[#FEE500] items-center justify-center">
          <Text className="text-[#000000] font-scdream text-3xl">K</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
