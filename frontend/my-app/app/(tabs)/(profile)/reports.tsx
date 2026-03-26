import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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
import { Ionicons } from '@expo/vector-icons';

export default function ReportsScreen() {
  const queryClient = useQueryClient();
  const { profile } = useUserProfileStore();
  const params = useLocalSearchParams<{ mode?: 'view' | 'edit' }>();
  
  // 화면 모드: 'view' (마이페이지 진입 시), 'edit' (갱신 버튼 클릭 시 또는 파라미터로 전달 시)
  const [mode, setMode] = useState<'view' | 'edit'>(params.mode || 'view');
  
  // 시간 수정 관련 상태
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedSupplementId, setSelectedSupplementId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState('09:00');
  
  // 수정된 시간들을 보관하는 로컬 맵 { userSupplementId: 'HH:mm' }
  const [tempTimes, setTempTimes] = useState<Record<number, string>>({});

  // 리포트 데이터 조회
  const { data: reportResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['report'],
    queryFn: () => reportApi.getReport(),
  });

  const report = reportResponse?.data.data;

  // 갱신 모드로 진입 시 초기 데이터 설정
  useEffect(() => {
    if (mode === 'edit' && report) {
      const initialTimes: Record<number, string> = {};
      report.timing_recommendations.forEach(rec => {
        rec.intake_timings.forEach(info => {
          if (info.intake_time) {
            initialTimes[rec.user_supplement_id] = info.intake_time;
          }
        });
      });
      setTempTimes(initialTimes);
    }
  }, [mode, report]);

  // 리포트 갱신 Mutation
  const refreshMutation = useMutation({
    mutationFn: () => reportApi.updateReport(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['report'] });
      setMode('edit');
      
      const newReport = res.data.data;
      if (newReport) {
        const initialTimes: Record<number, string> = {};
        newReport.timing_recommendations.forEach(rec => {
          rec.intake_timings.forEach(info => {
            if (info.intake_time) {
              initialTimes[rec.user_supplement_id] = info.intake_time;
            }
          });
        });
        setTempTimes(initialTimes);
      }
      
      Alert.alert('리포트 갱신 완료', '최신 정보를 바탕으로 분석이 완료되었습니다. 추천 시간을 확인해 주세요.');
    },
    onError: () => {
      Alert.alert('오류', '리포트 갱신 중 문제가 발생했습니다.');
    },
  });

  // 저장 처리
  const [isSaving, setIsSaving] = useState(false);
  const handleSave = async () => {
    if (Object.keys(tempTimes).length === 0) {
      router.replace('/(tabs)/(home)');
      return;
    }

    setIsSaving(true);
    try {
      const promises = Object.entries(tempTimes).map(([id, time]) => 
        reportApi.updateRecommendedTime(Number(id), time)
      );
      
      await Promise.all(promises);
      
      Alert.alert('저장 완료', '맞춤 복용 시간이 반영되었습니다.', [
        { text: '확인', onPress: () => router.replace('/(tabs)/(home)') }
      ]);
    } catch (err) {
      Alert.alert('저장 실패', '정보를 저장하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTime = (userSupplementId: number, initialTime: string) => {
    setSelectedSupplementId(userSupplementId);
    setCurrentTime(tempTimes[userSupplementId] || initialTime);
    setTimePickerVisible(true);
  };

  const handleTimeConfirm = (time: string) => {
    if (selectedSupplementId !== null) {
      setTempTimes(prev => ({ ...prev, [selectedSupplementId]: time }));
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer header={<TopHeader title="분석 리포트" onBackPress={() => router.back()} />}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-4 font-scdream text-gray-400">데이터를 불러오는 중...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error || !report) {
    return (
      <ScreenContainer header={<TopHeader title="분석 리포트" onBackPress={() => router.back()} />}>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} className="mb-4" />
          <Text className="text-base font-scdream text-center mb-6" style={{ color: colors.text }}>
            리포트 데이터를 불러오지 못했습니다.{"\n"}서버 상태를 확인해 주세요.
          </Text>
          <AppButton title="새로고침" onPress={() => refetch()} />
        </View>
      </ScreenContainer>
    );
  }

  // 추천 제품 평탄화 (Flat list for UI)
  const flatProducts = report.recommendedProductsByIngredient.flatMap(group => 
    group.recommendedProducts.map(p => ({
      productCode: p.productCode,
      productName: p.productName,
      brand: p.brand || '',
      pillImageUrl: p.pillImageUrl || ''
    }))
  ).slice(0, 5); // 최대 5개 유지

  // 날짜 포맷 (updatedAt: "2024-03-26T12:34:56" -> "2024.03.26")
  const displayDate = report.updatedAt ? report.updatedAt.split('T')[0].replace(/-/g, '.') : '';

  return (
    <ScreenContainer header={<TopHeader title={mode === 'edit' ? "리포트 갱신" : "분석 리포트"} onBackPress={() => router.back()} />}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
      >
        <View className="py-2">
          {/* 리포트 갱신 배너 */}
          {mode === 'view' && report.needsRefresh && (
            <TouchableOpacity 
              onPress={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              className="mb-8 p-5 rounded-3xl bg-orange-50 border border-orange-100 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View className="flex-1 mr-3">
                <Text className="text-sm font-bold text-orange-600 mb-1">영양제 정보가 변경되었습니다!</Text>
                <Text className="text-xs text-orange-400" numberOfLines={1}>최신 정보를 반영해 리포트를 갱신해 보세요.</Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-orange-500 items-center justify-center">
                {refreshMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="refresh" size={20} color="white" />
                )}
              </View>
            </TouchableOpacity>
          )}

          <Text className="mb-4 text-xs font-scdream" style={{ color: colors.textMuted }}>
            {displayDate} 생성 리포트
          </Text>

          {/* 분석 리포트 섹션 */}
          <AnalysisReport comments={report.comments} />

          {/* 추천 제품 섹션 */}
          <ProductRecommendation nickname={profile.nickname} products={flatProducts as any} />

          {/* 갱신 모드 전용 섹션 */}
          {mode === 'edit' && (
            <View className="mt-4">
              <TimeRecommendation
                recommendations={report.timing_recommendations.map(rec => ({
                  userSupplementId: rec.user_supplement_id,
                  name: rec.alias,
                  recommendedIntakeTime: tempTimes[rec.user_supplement_id] || (rec.intake_timings[0]?.intake_time || '09:00'),
                  reason: '' // backend doesn't provide reason in this DTO
                }))}
                onEditTime={handleEditTime}
              />

              <View className="mt-6">
                <AppButton
                  title={isSaving ? "저장 중..." : "설정 완료 및 시간 저장"}
                  onPress={handleSave}
                  disabled={isSaving}
                  className="bg-primary shadow-lg"
                />
                <TouchableOpacity 
                  onPress={() => setMode('view')}
                  className="mt-4 items-center"
                >
                  <Text className="text-sm text-gray-400 underline font-scdream">취소하고 돌아가기</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {mode === 'view' && (
             <AppButton
               title="확인"
               onPress={() => router.back()}
               className="mt-8 mb-4 bg-gray-200"
             />
          )}
        </View>
      </ScrollView>

      <TimePicker
        isVisible={isTimePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        onConfirm={handleTimeConfirm}
        initialTime={currentTime}
      />
    </ScreenContainer>
  );
}
