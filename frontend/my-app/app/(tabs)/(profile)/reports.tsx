import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '@/src/api/report';
import { useSupplementsList } from '@/hooks/useSupplement';
import { intakeRoutineApi } from '@/src/api/intakeRoutine';
import { useUserProfileStore } from '@/src/store/userProfileStore';
import { useAuthStore } from '@/src/store/authStore';
import { AnalysisReport } from '@/src/components/profile/report/AnalysisReport';
import { ProductRecommendation } from '@/src/components/profile/report/ProductRecommendation';
import { TimeRecommendation } from '@/src/components/profile/report/TimeRecommendation';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { AppButton } from '@/src/components/common/AppButton';
import { TimePicker } from '@/src/components/common/TimePicker';
import { colors } from '@/constants/theme/colors';
import { softWellnessCard } from '@/constants/theme/neumorphism';
import { Ionicons } from '@expo/vector-icons';
import { appAlert } from '@/src/utils/appAlert';

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
  const authNickname = useAuthStore((s) => s.nickname);
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
  const hasTriggeredAutoReportRefresh = useRef(false);

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
      await queryClient.refetchQueries({ queryKey: ['report'] });
      
      setMode('edit');
      appAlert('리포트 갱신 완료', '최신 정보를 바탕으로 분석이 완료되었습니다. 영양제별 추천 시간을 확인해 주세요.');
    },
    onError: () => {
      appAlert('오류', '리포트 갱신 중 문제가 발생했습니다.');
    },
  });

  // GET 리포트에 성분 분석이 비어 있으면 1회 자동 갱신 시도
  useEffect(() => {
    if (!report || refreshMutation.isPending || hasTriggeredAutoReportRefresh.current) return;
    const ingredientAnalysis = report.ingredient_analysis || report.ingredientAnalysis || [];
    if (Array.isArray(ingredientAnalysis) && ingredientAnalysis.length === 0) {
      hasTriggeredAutoReportRefresh.current = true;
      refreshMutation.mutate();
    }
  }, [report, refreshMutation]);

  // 저장 처리
  const [isSaving, setIsSaving] = useState(false);
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const reportId = report?.reportId ?? report?.report_id;
      if (!reportId) {
        appAlert('저장 실패', '리포트 ID를 확인할 수 없습니다.');
        return;
      }

      const recommendations = getTimingRecommendations(report);
      let userSupplements = recommendations
        .map((rec: any) => {
          const userSupplementId = rec.user_supplement_id || rec.userSupplementId;
          const intakeTimings = rec.intake_timings || rec.intakeTimings || [];
          const intakeTimes = Array.from(
            new Set(
              intakeTimings
                .map((info: any) => {
                  const timingEnum = info.intake_timing || info.intakeTiming;
                  const defaultTime = info.intake_time || info.intakeTime || '';
                  return tempSupplementTimes[`${userSupplementId}_${timingEnum}`] || defaultTime;
                })
                .filter((time: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)),
            ),
          );

          return { userSupplementId, intakeTimes };
        })
        .filter(
          (item: { userSupplementId: number; intakeTimes: string[] } | null): item is { userSupplementId: number; intakeTimes: string[] } =>
            !!item && !!item.userSupplementId && item.intakeTimes.length > 0,
        );

      // recommendations 기반 결과가 비어 있으면 화면에 표시 중인 값으로 fallback 구성
      if (userSupplements.length === 0) {
        userSupplements = supplementRecommendations
          .map((item) => ({
            userSupplementId: item.userSupplementId,
            intakeTimes: Array.from(
              new Set(
                item.timings
                  .map((t: { intakeTime: string }) => t.intakeTime)
                  .filter((time: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)),
              ),
            ),
          }))
          .filter((item) => item.intakeTimes.length > 0);
      }

      if (userSupplements.length === 0) {
        appAlert('저장 실패', '확정 저장할 영양제/시간이 없습니다.');
        return;
      }

      console.log('[Report Save Debug] reportId:', reportId);
      console.log('[Report Save Debug] PATCH payload:', { userSupplements });

      // 1) 복용 시각 확정 저장
      await reportApi.saveIntakeTimings(reportId, { userSupplements });

      // 2) 저장 성공 후 리포트 재생성/갱신
      try {
        const refreshed = await reportApi.updateReport();

        // POST /reports 응답에 최신 timing_recommendations가 포함되므로,
        // GET /reports 재조회 타이밍 이슈가 있어도 화면에 즉시 반영되도록 캐시를 선반영
        const refreshedData = refreshed?.data?.data;
        if (refreshedData?.timing_recommendations) {
          queryClient.setQueryData(['report'], (prev: any) => {
            const prevDetail = prev?.data?.data ?? {};
            return {
              ...prev,
              data: {
                ...(prev?.data ?? {}),
                data: {
                  ...prevDetail,
                  timing_recommendations: refreshedData.timing_recommendations,
                  timingRecommendations: refreshedData.timing_recommendations,
                  needsRefresh: refreshedData.needsRefresh ?? prevDetail.needsRefresh,
                  updated_at: refreshedData.updatedAt ?? prevDetail.updated_at,
                  updatedAt: refreshedData.updatedAt ?? prevDetail.updatedAt,
                },
              },
            };
          });
        }
      } catch (refreshErr) {
        const re = refreshErr as any;
        const refreshStatus = re?.response?.status;
        const refreshData = re?.response?.data;
        console.log('[Report Refresh Error] status:', refreshStatus);
        console.log('[Report Refresh Error] data:', refreshData);
        console.log('[Report Refresh Error] request url:', re?.config?.url);
        appAlert(
          '일부 완료',
          '복용 시각 저장은 완료되었지만 리포트 갱신에 실패했습니다.\n네트워크 상태 확인 후 다시 시도해 주세요.',
        );
      }
      
      // 저장 성공 후 모든 관련 쿼리 무효화 (동기화)
      await queryClient.invalidateQueries({ queryKey: ['report'] });
      await queryClient.invalidateQueries({ queryKey: ['intakeSettings'] });
      await queryClient.invalidateQueries({ queryKey: ['supplements'] });
      await queryClient.invalidateQueries({ queryKey: ['supplement'] }); // 개별 상세 쿼리도 무효화
      // 홈 화면은 `useDailyIntakeSchedule()`(['dailyIntakeSchedule', '__today__'])를 사용
      await queryClient.invalidateQueries({ queryKey: ['dailyIntakeSchedule'] });
      // 화면에 즉시 반영되도록 강제 재조회
      await queryClient.refetchQueries({ queryKey: ['report'] });
      
      appAlert('저장 완료', '맞춤 복용 시간이 반영되었습니다.', [
        { text: '확인', onPress: () => {
          if (router.canDismiss()) {
            router.dismissAll();
          }
          router.replace('/(tabs)/(home)');
        }}
      ]);
    } catch (err) {
      const e = err as any;
      const status = e?.response?.status;
      const data = e?.response?.data;
      const message = data?.message || e?.message || '정보를 저장하지 못했습니다.';
      console.log('[Report Save Error] status:', status);
      console.log('[Report Save Error] data:', data);
      console.log('[Report Save Error] request url:', e?.config?.url);
      console.log('[Report Save Error] request data:', e?.config?.data);

      // 디버그 모드: 500 발생 시 영양제 1개씩 분리 요청해 실패 지점 추적
      if (status === 500) {
        try {
          const requestData = JSON.parse(e?.config?.data ?? '{}');
          const reportId = report?.reportId ?? report?.report_id;
          const supplements = requestData?.userSupplements ?? [];

          if (reportId && Array.isArray(supplements) && supplements.length > 1) {
            console.log('[Report Save Debug] start single-supplement probe');
            for (const item of supplements) {
              try {
                await reportApi.saveIntakeTimings(reportId, { userSupplements: [item] });
                console.log('[Report Save Debug] single success:', item);
              } catch (probeErr: any) {
                console.log('[Report Save Debug] single fail item:', item);
                console.log('[Report Save Debug] single fail status:', probeErr?.response?.status);
                console.log('[Report Save Debug] single fail data:', probeErr?.response?.data);
              }
            }
          }
        } catch (probeParseErr) {
          console.log('[Report Save Debug] single probe skipped:', probeParseErr);
        }
      }

      appAlert('저장 실패', `status=${status ?? 'unknown'}\n${String(message)}`);
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
            리포트를 불러오는 중입니다.{"\n"}잠시만 기다려주세요.
          </Text>
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
          <Text className="mb-4 text-sm font-scdream" style={{ color: colors.textMuted }}>
            {displayDate ? `${displayDate} 생성 리포트입니다.` : '최신 리포트입니다.'}
          </Text>

          {/* 분석 리포트 섹션 */}
          <AnalysisReport
            comments={report.comments}
            ingredientAnalysis={report.ingredient_analysis || report.ingredientAnalysis || []}
          />

          {/* 추천 제품 섹션 */}
          <ProductRecommendation 
            nickname={authNickname || profile.nickname || '회원'} 
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
              <View className="mb-6 h-[1px]" style={{ backgroundColor: `${colors.shadowDark}2A` }} />
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
                  <Text className="text-sm underline font-scdream" style={{ color: colors.textMuted }}>취소하고 돌아가기</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {mode === 'view' && (
             <AppButton
               title="확인"
               onPress={() => router.back()}
               className="mt-8 mb-4"
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
