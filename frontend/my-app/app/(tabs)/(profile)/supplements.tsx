import { View, Text, FlatList } from 'react-native';

export default function SupplementsScreen() {
  // const page = 0;
  // const size = 10;
  //
  // const { data: supplements } = useQuery({
  //   queryKey: ['supplements', page, size],
  //   queryFn: async () => {
  //     const response = await api.get(`/api/supplements?page=${page}&size=${size}`);
  //     return response.data;
  //   },
  // });

  const mockSupplements = [
    { id: '1', name: '종합 비타민' },
    { id: '2', name: '오메가-3' },
    { id: '3', name: '유산균' },
  ];

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={mockSupplements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-6 py-4 border-b border-gray-100">
            <Text className="text-base font-scdream text-black">{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="text-gray-400 font-scdream">등록된 영양제가 없습니다.</Text>
          </View>
        }
        contentContainerClassName="pb-10"
      />
    </View>
  );
}
