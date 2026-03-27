import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '@/src/api/report';
import { useSupplementsList } from '@/hooks/useSupplement';
import { intakeRoutineApi } from '@/src/api/intakeRoutine';
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

const TIMING_DISPLAY_MAP: Record<string, string> = {
  BEFORE_BREAKFAST: '아침 식전',
  AFTER_BREAKFAST: '아침 식후',
  BEFORE_LUNCH: '점심 식전',
  AFTER_LUNCH: '점심 식후',
  BEFORE_DINNER: '저녁 식전',
  AFTER_DINNER: '저녁 식후',
  BEFORE_SLEEP: '취침 전',
};

export default function ReportsScreen() {
  const queryClient = useQueryClient();
  const { profile } = useUserProfileStore();
  const params = useLocalSearchParams<{ mode?: 'view' | 'edit'; from?: 'banner' }>();
  
  // 화면 모드: 'view' (마이페이지 진입 시), 'edit' (갱신 버튼 클릭 시 또는 파라미터로 전달 시)
  const [mode, setMode] = useState<'view' | 'edit'>(params.mode || 'view');
  
  // 시간 수정 관련 상태
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedSupplementId, setSelectedSupplementId] = useState<number | null>(null);
  const [selectedTiming, setSelectedTiming] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('09:00');
  
  // 수정된 시간들을 보관하는 로컬 맵 { INTAKE_TIMING_ENUM: 'HH:mm' }
  const [tempTimes, setTempTimes] = useState<Record<string, string>>({});

  // 리포트 데이터 조회
  const { data: reportResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['report'],
    queryFn: () => reportApi.getReport(),
  });

  const { data: supplementsResponse } = useSupplementsList();
  const report = reportResponse?.data?.data;

  // 데이터 변동 감지 (백엔드 needsRefresh 보완)
  const isDataMismatch = React.useMemo(() => {
    if (!report || !supplementsResponse?.supplements) return false;

    const currentIds = (supplementsResponse.supplements as any[])
      .map((s: any) => s.userSupplementId)
      .sort((a: number, b: number) => a - b)
      .join(',');

    const reportedIds = (report.timing_recommendations || [])
      .map((r: any) => r.user_supplement_id)
      .sort((a: number, b: number) => a - b)
      .join(',');

    return currentIds !== reportedIds;
  }, [report, supplementsResponse?.supplements]);

  const needsRefresh = !!report?.needsRefresh || isDataMismatch;

  // 유저 섭취 시간 설정 조회
  const { data: settingsResponse } = useQuery({
    queryKey: ['intakeSettings'],
    queryFn: () => intakeRoutineApi.getSettings(),
  });
  const settings = settingsResponse?.data?.data?.settings || [];

  // 갱신 모드로 진입 시 초기 데이터 설정
  useEffect(() => {
    if (mode === 'edit' && report) {
      const initialTimes: Record<string, string> = {};
      report.timing_recommendations.forEach(rec => {
        rec.intake_timings.forEach(info => {
          if (info.intake_time) {
            initialTimes[info.intake_timing] = info.intake_time;
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
      // 갱신된 데이터를 캐시에 즉시 반영
      queryClient.setQueryData(['report'], res.data);
      queryClient.invalidateQueries({ queryKey: ['report'] });
      setMode('edit');
      
      const newReport = res?.data?.data;
      if (newReport && newReport.timing_recommendations) {
        const initialTimes: Record<string, string> = {};
        newReport.timing_recommendations.forEach(rec => {
          if (rec.intake_timings) {
            rec.intake_timings.forEach(info => {
              if (info.intake_time) {
                initialTimes[info.intake_timing] = info.intake_time;
              }
            });
          }
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
      // tempTimes: { BREAKFAST: '09:00' }
      // settings에서 해당 enum에 맞는 display명을 갖는 settingId 탐색
      // (백엔드 DTO가 intakeTiming에 displayName을 넣어주므로 매핑 필요)
      const savePromises = Object.entries(tempTimes).map(([timingEnum, time]) => {
        const displayName = TIMING_DISPLAY_MAP[timingEnum];
        const setting = settings.find((s: any) => s.intakeTiming === displayName);
        
        if (setting) {
          return intakeRoutineApi.updateSetting(setting.userIntakeTimingSettingId, { intakeTime: time });
        }
        return Promise.resolve();
      });
      
      await Promise.all(savePromises);
      
      // 저장 성공 후 리포트/세팅 쿼리 갱신
      queryClient.invalidateQueries({ queryKey: ['report'] });
      queryClient.invalidateQueries({ queryKey: ['intakeSettings'] });
      
      Alert.alert('저장 완료', '맞춤 복용 시간이 반영되었습니다.', [
        { text: '확인', onPress: () => router.replace('/(tabs)/(home)') }
      ]);
    } catch (err) {
      Alert.alert('저장 실패', '정보를 저장하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTime = (userSupplementId: number, intakeTiming: string, initialTime: string) => {
    setSelectedSupplementId(userSupplementId);
    setSelectedTiming(intakeTiming);
    setCurrentTime(tempTimes[intakeTiming] || initialTime);
    setTimePickerVisible(true);
  };

  const handleTimeConfirm = (time: string) => {
    if (selectedTiming) {
      setTempTimes(prev => ({ ...prev, [selectedTiming]: time }));
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
  const flatProducts = (report.recommendedProductsByIngredient || []).flatMap(group => 
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
          {/* 리포트 갱신 버튼 (최상단 노출 - 배너 진입이 아니며 갱신이 필요할 때만 노출) */}
          {needsRefresh && params.from !== 'banner' && (
            <TouchableOpacity 
              onPress={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              className="mb-8 p-5 rounded-3xl bg-orange-50 border border-orange-100 flex-row items-center justify-between shadow-sm"
              activeOpacity={0.7}
            >
              <View className="flex-1 mr-3">
                <View className="flex-row items-center mb-1">
                  <Ionicons name="sparkles" size={16} color="#EA580C" className="mr-2" />
                  <Text className="text-sm font-bold text-orange-600">리포트 갱신하기</Text>
                </View>
                <Text className="text-xs text-orange-400" numberOfLines={1}>변경된 영양제 정보를 바탕으로 AI 분석을 다시 실행합니다.</Text>
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
                recommendations={(report.timing_recommendations || []).flatMap(rec => 
                  rec.intake_timings.map((info, idx) => ({
                    userSupplementId: rec.user_supplement_id * 100 + idx, // 고유 키용 임시 조합
                    name: rec.alias,
                    intakeTiming: info.intake_timing,
                    recommendedIntakeTime: tempTimes[info.intake_timing] || (info.intake_time || '09:00'),
                    reason: `${TIMING_DISPLAY_MAP[info.intake_timing] || info.intake_timing} 추천`
                  }))
                )}
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
