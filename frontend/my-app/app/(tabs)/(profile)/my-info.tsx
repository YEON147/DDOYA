import { View, Text, ScrollView } from 'react-native';

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
    <ScrollView className="flex-1 bg-white">
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
    </ScrollView>
  );
}
