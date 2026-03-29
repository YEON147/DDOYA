import { router } from 'expo-router';
import { Pill, FileText, User, Bell, ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/theme/colors';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { AppIcon } from '@/src/components/common/AppIcon';
import { useAuthStore } from '@/src/store/authStore';
import { View, Text, Pressable, useWindowDimensions, ScrollView } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { neuRaised } from '@/constants/theme/neumorphism';
import { scaleByWidth } from '@/src/utils/responsive';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { tokenService } from '@/src/api/token';
import { Calendar } from 'react-native-calendars';
import { useDailyIntakeSchedule } from '@/hooks/useIntakeRoutine';
import { useSupplementsList } from '@/hooks/useSupplement';
import {
  getLocalCalendarDateKeySnapshot,
  subscribeLocalCalendarDay,
} from '@/src/utils/localCalendarDay';

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const { nickname } = useAuthStore();
  const horizontalPadding = scaleByWidth(width, 18, { min: 14, max: 22 });
  const cardRadius = scaleByWidth(width, 20, { min: 16, max: 22 });
  const [ddoyaStartIso, setDdoyaStartIso] = useState<string | null>(null);
  const {
    data: todaySchedule,
    isPending: isSchedulePending,
    refetch: refetchTodaySchedule,
  } = useDailyIntakeSchedule();
  const calendarDayKey = useSyncExternalStore(
    subscribeLocalCalendarDay,
    getLocalCalendarDateKeySnapshot,
    getLocalCalendarDateKeySnapshot,
  );
  const { data: supplementsData } = useSupplementsList();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      void refetchTodaySchedule();
    }, [refetchTodaySchedule]),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await tokenService.getDdoyaStartDate();
      if (cancelled) return;
      if (stored) {
        setDdoyaStartIso(stored);
        return;
      }
      const todayIso = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      await tokenService.setDdoyaStartDate(todayIso);
      if (!cancelled) setDdoyaStartIso(todayIso);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ddoyaDay = useMemo(() => {
    if (!ddoyaStartIso) return null;
    const start = new Date(ddoyaStartIso + 'T00:00:00');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(1, diffDays + 1);
  }, [ddoyaStartIso]);

  const markedDates = useMemo(
    () => ({
      [calendarDayKey]: {
        selected: true,
        selectedColor: `${colors.brown}CC`,
        selectedTextColor: '#FFFFFF',
      },
    }),
    [calendarDayKey],
  );

  const todayMetrics = useMemo(() => {
    const timeSlots = todaySchedule?.timeSlots ?? [];
    const items = timeSlots.flatMap((s) => s.items ?? []);
    const total = items.length;
    const completed = items.filter((i) => i.status === 'TAKEN').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [todaySchedule]);

  const supplementsCount = useMemo(() => {
    const list = supplementsData?.supplements ?? [];
    return list.length;
  }, [supplementsData]);

  return (
    <ScreenContainer
      scrollRef={scrollRef}
      contentContainerStyle={{
        paddingHorizontal: 0,
        paddingTop: scaleByWidth(width, 20, { min: 16, max: 26 }),
        // 탭바에 가려지지 않게 "스크롤 가능한 영역"만 확보 (내용이 짧을 때도 회색 박스처럼 보이지 않게 최소만)
        paddingBottom: Math.max(0, tabBarHeight - 10),
      }}
    >
      <View style={{ paddingHorizontal: horizontalPadding }}>
        {/* 프로필 카드 (참고 이미지 스타일) */}
        <View className="mb-4">
          {/* 상단 프로필 영역 */}
          <View className="items-center px-4" style={{ paddingTop: scaleByWidth(width, 20, { min: 16, max: 24 }), paddingBottom: 14 }}>
            <View className="w-full flex-row items-center justify-between px-1">
              <View className="flex-1 pr-3">
                <Text className="text-[20px] font-scdream-bold pb-1" style={{ color: colors.text }} numberOfLines={1}>
                  {(nickname || '회원') + '님'}
                </Text>
                <Text className="mt-1.5 text-md font-scdream" style={{ color: colors.textMuted }} numberOfLines={1}>
                  {ddoyaDay ? `DDOYA와 건강해지기 ${ddoyaDay}일차` : 'DDOYA와 건강해지기'}
                </Text>
              </View>
              <View
                className="items-center justify-center rounded-full"
                style={{
                  width: scaleByWidth(width, 50, { min: 44, max: 58 }),
                  height: scaleByWidth(width, 50, { min: 44, max: 58 }),
                  backgroundColor: colors.surfaceWarm,
                  borderWidth: 1,
                  borderColor: `${colors.shadowDark}22`,
                }}
              >
                <AppIcon icon={User} size={22} color={colors.iconMuted} strokeWidth={1.8} />
              </View>
            </View>

            <View className="mt-4 w-full px-1">
              <View className="mb-3" style={{ height: 1, backgroundColor: `${colors.shadowDark}22` }} />
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm font-scdream-medium" style={{ color: colors.text }}>
                  오늘 복용 진행
                </Text>
                <Text className="text-sm font-scdream-medium" style={{ color: colors.brown }}>
                  {isSchedulePending ? '—' : `${todayMetrics.completed} / ${todayMetrics.total}`}
                </Text>
              </View>
              <View className="h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: `${colors.shadowDark}22` }}>
                <View
                  style={{
                    width: isSchedulePending || todayMetrics.total === 0 ? '0%' : `${Math.min(100, todayMetrics.percent)}%`,
                    height: '100%',
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
            </View>
          </View>

          {/* 통계 3분할 */}
          <View style={{ borderTopWidth: 1, borderTopColor: `${colors.shadowDark}22` }}>
            <View className="flex-row">
              {(
                [
                  { top: isSchedulePending ? '—' : `${todayMetrics.completed}/${todayMetrics.total}`, bottom: '오늘 복용' },
                  { top: isSchedulePending ? '—' : `${todayMetrics.percent}%`, bottom: '오늘 달성률' },
                  { top: `${supplementsCount}종`, bottom: '복용 영양제' },
                ] as const
              ).map((s, idx) => (
                <View
                  key={s.bottom}
                  className="flex-1 items-center justify-center px-2 py-5"
                  style={{
                    borderRightWidth: idx === 2 ? 0 : 1,
                    borderRightColor: `${colors.shadowDark}22`,
                  }}
                >
                  <Text className="text-[17px] font-scdream-medium tracking-tight" style={{ color: colors.text }}>
                    {s.top}
                  </Text>
                  <Text className="mt-1.5 text-xs font-scdream" style={{ color: colors.textMuted }}>
                    {s.bottom}
                  </Text>
                </View>
              ))}
            </View>
          </View>

        </View>

        {/* 메뉴 (리스트 형태) */}
        <View
          className="overflow-hidden"
          style={[
            neuRaised(18, colors.cardIvory),
            {
              borderRadius: cardRadius,
              borderWidth: 1,
              borderColor: `${colors.shadowDark}22`,
            },
          ]}
        >
          {(
            [
              { label: '내 정보', icon: User, onPress: () => router.push('/myInfo' as never) },
              { label: '영양제 관리', icon: Pill, onPress: () => router.push('/supplements') },
              { label: '리포트', icon: FileText, onPress: () => router.push('/reports') },
              { label: '알림 설정', icon: Bell, onPress: () => router.push('/notification-settings' as never) },
            ] as const
          ).map((item, idx, arr) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              className="flex-row items-center px-4 py-4"
              style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                backgroundColor: pressed ? `${colors.shadowDark}08` : 'transparent',
                borderBottomWidth: idx === arr.length - 1 ? 0 : 1,
                borderBottomColor: `${colors.shadowDark}18`,
              })}
            >
              <View className="mr-3 h-10 w-10 items-center justify-center">
                <AppIcon icon={item.icon} size={22} color={colors.brown} strokeWidth={1.9} />
              </View>
              <Text className="flex-1 text-md font-scdream-medium tracking-tight" style={{ color: colors.text }}>
                {item.label}
              </Text>
              <AppIcon icon={ChevronRight} size={18} color={`${colors.iconMuted}AA`} strokeWidth={1.8} />
            </Pressable>
          ))}
        </View>

        {/* 하단 달력 */}
        <View className="mt-4">
          <View
            className="overflow-hidden rounded-2xl px-2 py-2"
            style={[
              neuRaised(16, colors.cardIvory),
              {
                borderWidth: 1,
                borderColor: `${colors.shadowDark}1A`,
                backgroundColor: colors.cardIvory,
              },
            ]}
          >
            <Calendar
              current={calendarDayKey}
              markedDates={markedDates}
              hideExtraDays={false}
              theme={{
                calendarBackground: 'transparent',
                textSectionTitleColor: colors.textMuted,
                monthTextColor: colors.text,
                dayTextColor: colors.text,
                textDisabledColor: `${colors.textMuted}66`,
                selectedDayBackgroundColor: `${colors.brown}CC`,
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: colors.brown,
                arrowColor: colors.brown,
                textMonthFontSize: 15,
                textMonthFontWeight: '600',
                textDayHeaderFontSize: 11,
                textDayFontSize: 12,
              }}
              style={{
                backgroundColor: 'transparent',
              }}
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
