import { View, Text } from 'react-native';
import { colors } from '@/constants/theme/colors';

export function NicknameHeader() {
  // const { data: user } = useQuery({
  //   queryKey: ['me'],
  //   queryFn: async () => {
  //     const response = await api.get('/api/users/me');
  //     return response.data;
  //   },
  // });

  const nickname = '박서연';

  return (
    <View className="px-6 pt-10 pb-6">
      <Text
        className="text-xl font-scdream leading-relaxed"
        style={{ color: colors.text }}
      >
        <Text style={{ color: colors.text }}>{nickname || '회원'}</Text>님{'\n'}오늘도 건강한 하루보내세요!
      </Text>
    </View>
  );
}
