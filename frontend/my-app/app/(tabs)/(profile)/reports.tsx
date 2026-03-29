import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
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
import { prefetchReportSquirrelImage } from '@/src/constants/reportSquirrelImage';
import { prefetchReportDecorAcorn } from '@/src/constants/reportDecorAcorn';
import { refreshCachesAfterSupplementChange } from '@/src/utils/supplementDbChangeSync';

const TIMING_DISPLAY_MAP: Record<string, string> = {
  BEFORE_BREAKFAST: '아침 식전',
  AFTER_BREAKFAST: '아침 식후',
  BEFORE_LUNCH: '점심 식전',
  AFTER_LUNCH: '점심 식후',
  BEFORE_DINNER: '저녁 식전',
  AFTER_DINNER: '저녁 식후',
  BEFORE_SLEEP: '취침 전',
};

const HH_MM = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * GET/POST 리포트 응답의 intake_time은 전역 섭취 설정 등과 섞여 PATCH로 확정한 시각과 다를 수 있음.
 * 방금 저장한 temp 맵으로 timing_recommendations의 HH:mm만 덮어 UI·캐시를 확정값과 맞춤.
 */
function applyTempTimesToReportCache(reportData: any, temp: Record<string, string>): any {
  if (!reportData) return reportData;
  const list = reportData.timing_recommendations || reportData.timingRecommendations;
  if (!Array.isArray(list) || list.length === 0) return reportData;

  const newList = list.map((rec: any) => {
    const supId = rec.user_supplement_id || rec.userSupplementId;
    const timings = rec.intake_timings || rec.intakeTimings;
    if (!supId || !Array.isArray(timings)) return rec;

    const newTimings = timings.map((info: any) => {
      const en = info.intake_timing || info.intakeTiming;
      const key = `${supId}_${en}`;
      const fromTemp = temp[key];
      if (fromTemp && HH_MM.test(fromTemp)) {
        return { ...info, intake_time: fromTemp, intakeTime: fromTemp };
      }
      return info;
    });
    return { ...rec, intake_timings: newTimings, intakeTimings: newTimings };
  });

  return {
    ...reportData,
    timing_recommendations: newList,
    timingRecommendations: newList,
  };
}

export default function ReportsScreen() {
  const queryClient = useQueryClient();
  const { profile } = useUserProfileStore();
  const authNickname = useAuthStore((s) => s.nickname);
  const params = useLocalSearchParams<{ mode?: 'view' | 'edit'; from?: string | string[] }>();
  const fromBanner =
    params.from === 'banner' ||
    (Array.isArray(params.from) && params.from.some((v) => v === 'banner'));
  const rawMode = params.mode;
  const paramMode = Array.isArray(rawMode) ? rawMode[0] : rawMode;

  // 화면 모드: 'view' (마이페이지 진입 시), 'edit' (갱신 버튼 클릭 시 또는 파라미터로 전달 시)
  const [mode, setMode] = useState<'view' | 'edit'>(() =>
    paramMode === 'edit' || fromBanner ? 'edit' : 'view',
  );
  
  // 시간 수정 관련 상태
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedSupplementId, setSelectedSupplementId] = useState<number | null>(null);
  const [selectedTiming, setSelectedTiming] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('09:00');
  
  // 수정된 시간들을 보관하는 로컬 맵 { "userSupplementId_INTAKE_TIMING_ENUM": 'HH:mm' }
  const [tempSupplementTimes, setTempSupplementTimes] = useState<Record<string, string>>({});
  const hasTriggeredAutoReportRefresh = useRef(false);
  /** `from=banner`는 파라미터가 남아 있으면 매 렌더마다 true라, 자동 갱신 1회만 소비 */
  const bannerAutoRefreshConsumedRef = useRef(false);
  /** 리포트 쿼리가 무효화·재조회돼도 피커로 수정한 값을 덮어쓰지 않도록 함 */
  const protectUserTimeEditsRef = useRef(false);
  const prevModeForTimesRef = useRef(mode);

  useEffect(() => {
    prefetchReportSquirrelImage();
    prefetchReportDecorAcorn();
  }, []);

  useFocusEffect(
    useCallback(() => {
      hasTriggeredAutoReportRefresh.current = false;
      bannerAutoRefreshConsumedRef.current = false;
    }, []),
  );

  // 헬퍼: 추천 시점 정보를 찾아 반환 (SNAKE_CASE/camelCase 대응)
  const getTimingRecommendations = (rep: any) => {
    return rep?.timing_recommendations || rep?.timingRecommendations || [];
  };

  // 리포트 데이터 조회 (`useReport`와 동일하게 본문만 캐시 — Axios 전체를 넣으면 `useReport`와 캐시 충돌)
  const { data: report, isLoading, error } = useQuery({
    queryKey: ['report'],
    queryFn: async () => {
      const res = await reportApi.getReport();
      return res.data.data;
    },
  });

  const { data: supplementsResponse } = useSupplementsList();

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

  // 편집 모드에서만 서버 리포트로 temp 초기화. 이미 시간을 고친 뒤에는 report 리패치만으로 덮어쓰지 않음.
  useEffect(() => {
    const prev = prevModeForTimesRef.current;
    prevModeForTimesRef.current = mode;

    if (mode !== 'edit') {
      protectUserTimeEditsRef.current = false;
      return;
    }

    if (prev !== 'edit') {
      protectUserTimeEditsRef.current = false;
    }

    if (!report) return;
    if (protectUserTimeEditsRef.current) return;

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
  }, [mode, report]);

  // 리포트 갱신 Mutation
  const refreshMutation = useMutation({
    mutationFn: () => reportApi.updateReport(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['report'] });
      await queryClient.invalidateQueries({ queryKey: ['intakeSettings'] });
      await queryClient.refetchQueries({ queryKey: ['report'] });

      setMode('edit');
      appAlert(
        '리포트 갱신 완료',
        '최신 정보를 바탕으로 분석이 완료되었습니다. 영양제별 추천 시간을 확인해 주세요.',
      );
    },
    onError: () => {
      hasTriggeredAutoReportRefresh.current = false;
      bannerAutoRefreshConsumedRef.current = false;
      appAlert('오류', '리포트 갱신 중 문제가 발생했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.');
    },
  });

  const handleManualRefreshReport = () => {
    refreshMutation.mutate();
  };

  // 성분 분석 비어 있음 / 서버 needsRefresh / 영양제 목록 불일치 / 배너(1회) 진입 시 POST로 리포트 재생성
  useEffect(() => {
    if (!report || refreshMutation.isPending || hasTriggeredAutoReportRefresh.current) return;

    const ingredientAnalysis = report.ingredient_analysis || report.ingredientAnalysis || [];
    const emptyIngredients = !Array.isArray(ingredientAnalysis) || ingredientAnalysis.length === 0;
    const serverNeedsRefresh = !!report.needsRefresh;
    const fromBannerOnce = fromBanner && !bannerAutoRefreshConsumedRef.current;

    const shouldRefresh =
      emptyIngredients || serverNeedsRefresh || isDataMismatch || fromBannerOnce;
    if (!shouldRefresh) return;

    if (fromBannerOnce) {
      bannerAutoRefreshConsumedRef.current = true;
    }
    hasTriggeredAutoReportRefresh.current = true;
    refreshMutation.mutate();
  }, [report, refreshMutation, isDataMismatch, fromBanner]);

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

      // 화면(TimeRecommendation)과 동일한 `supplementRecommendations`에서만 페이로드를 만든다.
      // 리포트 raw `intake_time`만 쓰면 전역 설정·피커로 보이는 시각과 어긋날 수 있음(특히 null일 때).
      // 회차별로 시각이 같아도 별도 스케줄이므로 Set으로 합치지 않는다.
      let userSupplements = supplementRecommendations
        .map((item) => ({
          userSupplementId: item.userSupplementId,
          intakeTimes: item.timings
            .map((t: { intakeTime: string }) => t.intakeTime)
            .filter((time: string) => HH_MM.test(time)),
        }))
        .filter((item) => item.userSupplementId && item.intakeTimes.length > 0);

      // 목록이 아직 없을 때만 리포트 구조로 최소 구성 (이론상 드묾)
      if (userSupplements.length === 0) {
        const recommendations = getTimingRecommendations(report);
        userSupplements = recommendations
          .map((rec: any) => {
            const userSupplementId = rec.user_supplement_id || rec.userSupplementId;
            const intakeTimings = rec.intake_timings || rec.intakeTimings || [];
            const intakeTimes = intakeTimings
              .map((info: any) => {
                const timingEnum = info.intake_timing || info.intakeTiming;
                const defaultTime = info.intake_time || info.intakeTime || '';
                return tempSupplementTimes[`${userSupplementId}_${timingEnum}`] || defaultTime;
              })
              .filter((time: string) => HH_MM.test(time));
            return { userSupplementId, intakeTimes };
          })
          .filter(
            (item: { userSupplementId: number; intakeTimes: string[] }): item is { userSupplementId: number; intakeTimes: string[] } =>
              !!item.userSupplementId && item.intakeTimes.length > 0,
          );
      }

      if (userSupplements.length === 0) {
        appAlert('저장 실패', '확정 저장할 영양제/시간이 없습니다.');
        return;
      }

      // 1) 복용 시각 확정 저장
      await reportApi.saveIntakeTimings(reportId, { userSupplements });

      queryClient.setQueryData(['report'], (prev: any) =>
        applyTempTimesToReportCache(prev ?? report, tempSupplementTimes),
      );

      // 2) 저장 성공 후 리포트 재생성/갱신
      try {
        const refreshed = await reportApi.updateReport();

        const refreshedData = refreshed?.data?.data;
        if (refreshedData) {
          queryClient.setQueryData(['report'], (prev: any) => {
            const prevDetail = prev ?? {};
            const merged = {
              ...prevDetail,
              ...(refreshedData.timing_recommendations && {
                timing_recommendations: refreshedData.timing_recommendations,
                timingRecommendations: refreshedData.timing_recommendations,
              }),
              ...(refreshedData.comments != null && { comments: refreshedData.comments }),
              needsRefresh: refreshedData.needsRefresh ?? prevDetail.needsRefresh,
              updated_at: refreshedData.updatedAt ?? prevDetail.updated_at,
              updatedAt: refreshedData.updatedAt ?? prevDetail.updatedAt,
            };
            return applyTempTimesToReportCache(merged, tempSupplementTimes);
          });
        }
      } catch {
        appAlert(
          '일부 완료',
          '복용 시각 저장은 완료되었지만 리포트 갱신에 실패했습니다.\n네트워크 상태 확인 후 다시 시도해 주세요.',
        );
      }
      
      // 저장 성공 후 리포트·루틴·영양제 캐시를 서버와 맞춤 (홈 일별 스케줄·목록 즉시 prefetch 포함)
      await refreshCachesAfterSupplementChange(queryClient);
      queryClient.setQueryData(['report'], (prev: any) =>
        applyTempTimesToReportCache(prev, tempSupplementTimes),
      );

      appAlert('', '맞춤 복용 시간이 반영되었습니다.', undefined, { autoDismissMs: 1000 });
      setTimeout(() => {
        if (router.canDismiss()) {
          router.dismissAll();
        }
        router.replace('/(tabs)/(home)');
      }, 1000);
    } catch (err) {
      const e = err as any;
      const status = e?.response?.status;
      const data = e?.response?.data;
      const message = data?.message || e?.message || '정보를 저장하지 못했습니다.';

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
      protectUserTimeEditsRef.current = true;
      setTempSupplementTimes((prev) => ({
        ...prev,
        [`${selectedSupplementId}_${selectedTiming}`]: time,
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
      <ScreenContainer header={<TopHeader title="" onBackPress={() => router.back()} />}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-4 font-scdream text-gray-400">데이터를 불러오는 중...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error || !report) {
    return (
      <ScreenContainer header={<TopHeader title="" onBackPress={() => router.back()} />}>
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
    <ScreenContainer header={<TopHeader title="" onBackPress={() => router.back()} />}>
      {refreshMutation.isPending && report ? (
        <View
          pointerEvents="auto"
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 50 }]}
          className="items-center justify-center px-8"
        >
          <ActivityIndicator size="large" color={colors.surface} />
          <Text className="mt-4 text-center text-base font-scdream-bold" style={{ color: colors.surface }}>
            리포트를 최신 정보로 갱신하는 중입니다
          </Text>
          <Text className="mt-2 text-center text-sm font-scdream" style={{ color: `${colors.surface}CC` }}>
            잠시만 기다려 주세요. (최대 수 분 걸릴 수 있어요)
          </Text>
        </View>
      ) : null}

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
                pillImageUrl: p.pill_image_url || p.pillImageUrl || '',
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
            <View className="mt-8 mb-4 gap-3">
              {needsRefresh ? (
                <AppButton
                  title={refreshMutation.isPending ? '갱신 중...' : '리포트 분석 갱신'}
                  onPress={handleManualRefreshReport}
                  disabled={refreshMutation.isPending}
                  className="bg-primary shadow-lg"
                />
              ) : null}
              <AppButton title="확인" onPress={() => router.back()} />
            </View>
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
