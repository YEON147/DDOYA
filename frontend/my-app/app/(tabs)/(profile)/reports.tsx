import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplementApi } from '@/src/api/supplement';
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
  
  // 수정된 시간들을 보관하는 로컬 맵 { "userSupplementId_INTAKE_TIMING_ENUM": 'HH:mm' }
  const [tempSupplementTimes, setTempSupplementTimes] = useState<Record<string, string>>({});

  // 헬퍼: 추천 시점 정보를 찾아 반환 (SNAKE_CASE/camelCase 대응)
  const getTimingRecommendations = (rep: any) => {
    return rep?.timing_recommendations || rep?.timingRecommendations || [];
  };

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

    const recommendations = getTimingRecommendations(report);
    const reportedIds = recommendations
      .map((r: any) => r.user_supplement_id || r.userSupplementId)
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
      const recommendations = getTimingRecommendations(report);
      
      recommendations.forEach((rec: any) => {
        const supId = rec.user_supplement_id || rec.userSupplementId;
        const timings = rec.intake_timings || rec.intakeTimings || [];
        timings.forEach((info: any) => {
          const timingEnum = info.intake_timing || info.intakeTiming;
          const intakeTime = info.intake_time || info.intakeTime;
          if (supId && timingEnum && intakeTime) {
            initialTimes[`${supId}_${timingEnum}`] = intakeTime;
          }
        });
      });
      setTempSupplementTimes(initialTimes);
    }
  }, [mode, report]);

  // 리포트 갱신 Mutation
  const refreshMutation = useMutation({
    mutationFn: () => reportApi.updateReport(),
    onSuccess: async (res) => {
      // 갱신 성공 시 데이터 정합성을 위해 쿼리 무효화 및 다시 불러오기
      await queryClient.invalidateQueries({ queryKey: ['report'] });
      await queryClient.invalidateQueries({ queryKey: ['intakeSettings'] });
      
      setMode('edit');
      Alert.alert('리포트 갱신 완료', '최신 정보를 바탕으로 분석이 완료되었습니다. 영양제별 추천 시간을 확인해 주세요.');
    },
    onError: () => {
      Alert.alert('오류', '리포트 갱신 중 문제가 발생했습니다.');
    },
  });

  // 저장 처리
  const [isSaving, setIsSaving] = useState(false);
  const handleSave = async () => {
    if (Object.keys(tempSupplementTimes).length === 0) {
      router.replace('/(tabs)/(home)');
      return;
    }

    setIsSaving(true);
    try {
      // 1. 변경된 영양제 ID 목록 추출
      const changedSupIds = Array.from(new Set(
        Object.keys(tempSupplementTimes).map(key => parseInt(key.split('_')[0]))
      ));

      // 2. 각 영양제별로 상세 정보를 조회하여 스케줄을 업데이트함
      for (const supId of changedSupIds) {
        // 이미 가지고 있는 영양제 목록에서 기본 정보 찾기
        const baseSup = (supplementsResponse?.supplements as any[])?.find(s => s.userSupplementId === supId);
        if (!baseSup) continue;

        // 상세 정보 조회를 통해 현재 스케줄(ID 포함)을 가져옴
        const detailRes = await supplementApi.getSupplementById(supId);
        const detail = detailRes.data.data;
        
        // 리포트 추천에서 이 영양제에 대해 제안된 항목들
        const recommendations = getTimingRecommendations(report).find((r: any) => (r.user_supplement_id || r.userSupplementId) === supId);
        const timings = recommendations?.intake_timings || recommendations?.intakeTimings || [];

        // 해당 영양제의 변경사항 적용
        const updatedSchedules = detail.intakeSchedules.map((s: any, idx: number) => {
          // 리포트에서 추천된 시점(예: AFTER_BREAKFAST)에 대해 유저가 수정한 시간이 있으면 반영.
          // 순서대로(idx) 매칭하는 것이 가장 확실함 (DailyDose와 추천 개수는 동일함)
          const matchedTiming = timings[idx];
          const timingEnum = matchedTiming?.intake_timing || matchedTiming?.intakeTiming;
          
          const newTime = timingEnum ? tempSupplementTimes[`${supId}_${timingEnum}`] : null;
          
          return {
            scheduleId: s.scheduleId,
            intakeTime: newTime || s.intakeTime
          };
        });

        // 영양제 정보 업데이트 API 호출
        await supplementApi.updateSupplement(supId, {
          alias: detail.alias,
          dailyDose: detail.dailyDose,
          dosePerIntake: detail.dosePerIntake,
          stockQuantity: detail.stockQuantity,
          stockNotificationEnabled: detail.stockNotificationEnabled,
          intakeSchedules: updatedSchedules
        });
      }
      
      // 저장 성공 후 모든 관련 쿼리 무효화 (동기화)
      await queryClient.invalidateQueries({ queryKey: ['report'] });
      await queryClient.invalidateQueries({ queryKey: ['intakeSettings'] });
      await queryClient.invalidateQueries({ queryKey: ['supplements'] });
      await queryClient.invalidateQueries({ queryKey: ['supplement'] }); // 개별 상세 쿼리도 무효화
      await queryClient.invalidateQueries({ queryKey: ['intakeSchedule'] });
      
      Alert.alert('저장 완료', '맞춤 복용 시간이 반영되었습니다.', [
        { text: '확인', onPress: () => {
          if (router.canDismiss()) {
            router.dismissAll();
          }
          router.replace('/(tabs)/(home)');
        }}
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('저장 실패', '정보를 저장하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTime = (userSupplementId: number, timingEnum: string, initialTime: string) => {
    setSelectedSupplementId(userSupplementId);
    setSelectedTiming(timingEnum);
    setCurrentTime(tempSupplementTimes[`${userSupplementId}_${timingEnum}`] || initialTime);
    setTimePickerVisible(true);
  };

  const handleTimeConfirm = (time: string) => {
    if (selectedSupplementId && selectedTiming) {
      setTempSupplementTimes(prev => ({ 
        ...prev, 
        [`${selectedSupplementId}_${selectedTiming}`]: time 
      }));
    }
  };

  // 영양제별 그룹화 로직 (새 구조: 전체 영양제 목록 기준)
  const supplementRecommendations = React.useMemo(() => {
    if (!supplementsResponse?.supplements) return [];
    
    // 리포트에서 추천 목록 추출 (데이터 구조 유연하게 대응)
    const recommendations = getTimingRecommendations(report);
    
    return (supplementsResponse.supplements as any[]).map(sup => {
      const supId = sup.userSupplementId;
      // 해당 영양제에 대한 추천 정보 찾기
      const rec = recommendations.find((r: any) => (r.user_supplement_id || r.userSupplementId) === supId);

      if (rec) {
        return {
          userSupplementId: supId,
          alias: rec.alias,
          timings: (rec.intake_timings || rec.intakeTimings || []).map((info: any) => {
            const timingEnum = info.intake_timing || info.intakeTiming;
            const timingLabel = TIMING_DISPLAY_MAP[timingEnum] || timingEnum;
            
            // 기본 시간 우선순위: 1. 임시 변경값 -> 2. 리포트 추천값 -> 3. 전역 설정값 -> 4. 09:00
            const globalSetting = settings.find(s => s.intakeTiming === timingLabel)?.intakeTime;
            const intakeTime = tempSupplementTimes[`${supId}_${timingEnum}`] || info.intake_time || info.intakeTime || globalSetting || '09:00';
            
            return {
              timingEnum,
              timingLabel,
              intakeTime
            };
          })
        };
      } else {
        // 신규 영양제 (리포트에 아직 없는 경우)
        // 기본적으로 '아침 식후'를 추천 시점 가이드로 노출 (유저 요구사항)
        const defaultTiming = 'AFTER_BREAKFAST';
        const timingLabel = TIMING_DISPLAY_MAP[defaultTiming];
        const globalSetting = settings.find(s => s.intakeTiming === timingLabel)?.intakeTime;
        
        return {
          userSupplementId: sup.userSupplementId,
          alias: sup.alias,
          timings: [{
            timingEnum: defaultTiming,
            timingLabel: `${timingLabel} (기본)`,
            intakeTime: tempSupplementTimes[`${supId}_${defaultTiming}`] || globalSetting || '09:00'
          }],
          isNew: true
        };
      }
    });
  }, [report, supplementsResponse?.supplements, tempSupplementTimes, settings]);

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

  // 날짜 포맷 (updatedAt: "2024-03-26T12:34:56" -> "2024.03.26")
  const updatedAt = report.updated_at || report.updatedAt;
  const displayDate = updatedAt ? updatedAt.split('T')[0].replace(/-/g, '.') : '';

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
          <ProductRecommendation 
            nickname={profile.nickname} 
            products={(report.recommended_products_by_ingredient || report.recommendedProductsByIngredient || []).flatMap((group: any) => 
              (group.recommended_products || group.recommendedProducts || []).map((p: any) => ({
                productCode: p.product_code || p.productCode,
                productName: p.product_name || p.productName,
                brand: p.brand || '',
                pillImageUrl: p.pill_image_url || p.pillImageUrl || ''
              }))
            ).slice(0, 5)} 
          />

          {/* 갱신 모드 전용 섹션 */}
          {mode === 'edit' && (
            <View className="mt-4">
              <TimeRecommendation
                supplementRecommendations={supplementRecommendations}
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
