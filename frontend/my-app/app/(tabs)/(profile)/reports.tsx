import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '@/src/api/report';
import { useUserProfileStore } from '@/src/store/userProfileStore';
import { AnalysisReport } from '@/src/components/profile/report/AnalysisReport';
import { ProductRecommendation } from '@/src/components/profile/report/ProductRecommendation';
import { TimeRecommendation } from '@/src/components/profile/report/TimeRecommendation';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { AppButton } from '@/src/components/common/AppButton';
import { TimePicker } from '@/src/components/common/TimePicker';
import { colors } from '@/constants/theme/colors';

export default function ReportsScreen() {
  const queryClient = useQueryClient();
  const { profile } = useUserProfileStore();
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedSupplementId, setSelectedSupplementId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState('09:00');

  // 리포트 데이터 조회
  const { data: reportResponse, isLoading, error } = useQuery({
    queryKey: ['report'],
    queryFn: () => reportApi.getReport(),
  });

  // 리포트 갱신 Mutation
  const refreshMutation = useMutation({
    mutationFn: () => reportApi.updateReport(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report'] });
      Alert.alert('알림', '리포트가 갱신되었습니다.');
    },
    onError: () => {
      Alert.alert('오류', '리포트 갱신 중 문제가 발생했습니다.');
    },
  });

  // 섭취 시간 변경 Mutation
  const updateTimeMutation = useMutation({
    mutationFn: (variables: { id: number; time: string }) =>
      reportApi.updateRecommendedTime(variables.id, variables.time),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report'] });
      Alert.alert('알림', '복용 시간이 변경되었습니다.');
    },
    onError: () => {
      Alert.alert('오류', '시간 변경 중 문제가 발생했습니다.');
    },
  });

  const handleEditTime = (userSupplementId: number, initialTime: string) => {
    setSelectedSupplementId(userSupplementId);
    setCurrentTime(initialTime);
    setTimePickerVisible(true);
  };

  const handleTimeConfirm = (time: string) => {
    if (selectedSupplementId !== null) {
      updateTimeMutation.mutate({ id: selectedSupplementId, time });
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer
        header={
          <TopHeader
            // title="리포트"
            title=""
          />
        }
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  const report = reportResponse?.data.data;

  return (
    <ScreenContainer
      header={
        <TopHeader
          // title="리포트"
          title=""
        />
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="py-6">
          {/* 리포트 갱신 버튼 (영양제 변동 시 노출) */}
          {report?.hasSupplementChanges && (
            <AppButton
              title="리포트 갱신하기"
              className="mb-6"
              onPress={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
            />
          )}

          <Text className="mb-2 text-sm font-scdream" style={{ color: colors.textMuted }}>
            {report?.date} 리포트
          </Text>

          {report && (
            <>
              {/* 분석 리포트 섹션 */}
              <AnalysisReport
                summary={report.summary}
                analysisResult={report.analysisResult}
              />

              {/* 추천 제품 섹션 */}
              <ProductRecommendation
                nickname={profile.nickname}
                products={report.recommendedProducts}
              />

              {/* 복용 시간 추천 섹션 */}
              <TimeRecommendation
                recommendations={report.intakeTimeRecommendations}
                onEditTime={handleEditTime}
              />
            </>
          )}

          {/* 확인 버튼 */}
          <AppButton
            title="확인"
            onPress={() => router.back()}
            className="mt-4"
          />
        </View>
      </ScrollView>

      {/* 시간 변경 모달 */}
      <TimePicker
        isVisible={isTimePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        onConfirm={handleTimeConfirm}
        initialTime={currentTime}
      />
    </ScreenContainer>
  );
}
