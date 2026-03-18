import { View, Text } from 'react-native';
import { useAuthStore } from '@/src/store/authStore';

export default function HomeScreen() {
  const { nickname } = useAuthStore();
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="font-scdream">Today</Text>
      <Text className="font-scdream">{nickname}님 잊지말고 섭취인증을 해주세요!</Text>
    
    </View>
  );
}