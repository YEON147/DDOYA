import { View, Text } from 'react-native';
import { colors } from '@/constants/theme/colors';
import { useAuthStore } from '@/src/store/authStore';

type NicknameHeaderProps = {
  message?: string;
};

export function NicknameHeader({ message = '오늘도 건강한 하루보내세요!' }: NicknameHeaderProps) {
  const { nickname } = useAuthStore();
  // const { data: user } = useQuery({
  //   queryKey: ['me'],
  //   queryFn: async () => {
  //     const response = await api.get('/api/users/me');
  //     return response.data;
  //   },
  // });
  return (
    <View className="p-3">
      <View>
        <Text
          className="mb-2 text-2xl font-scdream-bold"
          style={{ color: colors.text }}
        >
          {nickname || '회원'}님
        </Text>
        <Text
          className="text-lg font-scdream-bold"
          style={{ color: colors.text }}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}
