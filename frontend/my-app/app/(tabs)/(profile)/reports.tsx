import { View, Text } from 'react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';

export default function ReportsScreen() {
  // const { data: report } = useQuery({
  //   queryKey: ['reports'],
  //   queryFn: async () => {
  //     const response = await api.get('/api/reports');
  //     return response.data;
  //   },
  // });

  const mockReport = {
    date: '2024-03-15',
    summary: '영양제 섭취율이 90%로 매우 높습니다. 꾸준한 섭취를 유지하세요.',
  };

  return (
    <ScreenContainer header={<TopHeader title="리포트" />}>
      <View className="px-6 py-8">
        <Text className="text-sm font-scdream text-gray-400 mb-2">{mockReport.date} 리포트</Text>
        <View className="bg-gray-50 rounded-2xl p-6">
          <Text className="text-base font-scdream text-black leading-relaxed">
            {mockReport.summary}
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
