import { View, Text } from 'react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';

export default function MyInfoScreen() {
  // const { data: userInfo } = useQuery({
  //   queryKey: ['my-info'],
  //   queryFn: async () => {
  //     const response = await api.get('/api/users/me');
  //     return response.data;
  //   },
  // });

  const mockUserInfo = {
    nickname: '박서연',
    email: 'seoyeon@example.com',
  };

  return (
    <ScreenContainer header={<TopHeader title="내 정보" />}>
      <View className="px-6 py-8">
        <View className="mb-6">
          <Text className="text-sm font-scdream text-gray-400 mb-1">닉네임</Text>
          <Text className="text-lg font-scdream text-black">{mockUserInfo.nickname}</Text>
        </View>
        <View className="mb-6">
          <Text className="text-sm font-scdream text-gray-400 mb-1">이메일</Text>
          <Text className="text-lg font-scdream text-black">{mockUserInfo.email}</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
