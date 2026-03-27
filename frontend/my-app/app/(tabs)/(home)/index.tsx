import { View, Text, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TodayRoutineHeroCard } from '@/src/components/common/TodayRoutineHeroCard';
import { HomeIntakeSlot } from '@/src/components/home/HomeIntakeSlot';
import { colors } from '@/constants/theme/colors';
import { neuInset, neuRaised } from '@/constants/theme/neumorphism';
import { AppIcon } from '@/src/components/common/AppIcon';
import { useDailyIntakeSchedule } from '@/hooks/useIntakeRoutine';
import { formatKoreanTime, formatKoreanTodayParts, hasPendingItems, slotFailDeadline } from '@/src/utils/nextIntake';
import { SvgXml } from 'react-native-svg';
import { useAuthStore } from '@/src/store/authStore';
import { scaleByWidth } from '@/src/utils/responsive';
import { useEffect, useRef, useState } from 'react';
import { intakeRoutineApi } from '@/src/api/intakeRoutine';

const DDOYA_LOGO_XML = `<svg width="1106" height="479" viewBox="0 0 1106 479" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_428_3034)">
<path d="M374.262 77.9967H517.232C568.76 77.9967 608.547 92.2747 636.596 120.831C664.644 149.26 678.668 183.59 678.668 223.822C678.668 249.459 672.259 273.7 659.441 296.545C646.749 319.263 628.092 336.967 603.471 349.659C578.849 362.223 549.088 368.506 514.186 368.506H374.262V77.9967ZM502.764 189.175V257.328H506C521.484 257.328 532.652 254.663 539.506 249.332C546.486 243.875 549.976 234.991 549.976 222.68C549.976 200.343 536.967 189.175 510.95 189.175H502.764Z" fill="#FF8B1F"/>
<path d="M358.162 77.9967H215.192C163.664 77.9967 123.876 92.2747 95.8281 120.831C67.7798 149.26 53.7557 183.59 53.7557 223.822C53.7557 249.459 60.1649 273.7 72.9833 296.545C85.6749 319.263 104.331 336.967 128.953 349.659C153.575 362.223 183.336 368.506 218.238 368.506H358.162V77.9967ZM229.66 189.175V257.328H226.424C210.94 257.328 199.772 254.663 192.918 249.332C185.938 243.875 182.448 234.991 182.448 222.68C182.448 200.343 195.457 189.175 221.474 189.175H229.66Z" fill="#54C3A8"/>
<path d="M684.728 371.827C663.977 371.827 646.368 364.561 631.9 350.03C617.495 335.434 610.292 317.666 610.292 296.725C610.292 275.848 617.495 258.175 631.9 243.706C646.368 229.175 663.977 221.909 684.728 221.909C705.542 221.909 723.152 229.175 737.557 243.706C752.025 258.175 759.259 275.848 759.259 296.725C759.259 317.666 752.025 335.434 737.557 350.03C723.152 364.561 705.542 371.827 684.728 371.827ZM684.728 277.593C680.603 277.593 677.177 279.052 674.448 281.971C671.719 284.827 670.355 288.444 670.355 292.823C670.355 297.201 671.719 300.85 674.448 303.769C677.177 306.625 680.603 308.052 684.728 308.052C688.916 308.052 692.375 306.625 695.103 303.769C697.832 300.85 699.196 297.201 699.196 292.823C699.196 288.444 697.832 284.827 695.103 281.971C692.375 279.052 688.916 277.593 684.728 277.593ZM869.009 369.448H804.663V306.054L749.265 224.193H814.372L836.836 257.128L859.205 224.193H924.312L869.009 306.054V369.448ZM961.34 369.448H896.994L947.443 224.193H1039.11L1089.56 369.448H1025.31L1016.93 344.89H969.716L961.34 369.448ZM981.424 310.622H1005.22L993.323 274.547L981.424 310.622Z" fill="#3F2207"/>
</g>
<defs>
<clipPath id="clip0_428_3034">
<rect width="1105.6" height="479" fill="white"/>
</clipPath>
</defs>
</svg>`;

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const unreadCount = 3;
  const nickname = useAuthStore((s) => s.nickname);
  const { data: schedule, isPending, isError, refetch, isRefetching } = useDailyIntakeSchedule();
  const timeSlots = schedule?.timeSlots ?? [];
  const slotCount = timeSlots.length;
  const { monthDay, weekday } = formatKoreanTodayParts();
  const horizontalPadding = scaleByWidth(width, 18, { min: 14, max: 22 });
  const topPadding = scaleByWidth(width, 18, { min: 14, max: 24 });
  const dateBarHeight = scaleByWidth(width, 40, { min: 34, max: 48 });
  const [now, setNow] = useState(() => new Date());
  const processingRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!schedule || isPending || isError) return;

    const overdueRecordIds = schedule.timeSlots
      .filter((slot) => {
        const deadline = slotFailDeadline(slot);
        if (!deadline) return false;
        return hasPendingItems(slot) && now.getTime() >= deadline.getTime();
      })
      .flatMap((slot) =>
        slot.items
          .filter((item) => item.status !== 'TAKEN' && item.status !== 'SKIPPED' && item.status !== 'MISSED')
          .map((item) => item.intakeRecordId),
      )
      .filter((id) => !processingRef.current.has(id));

    if (overdueRecordIds.length === 0) return;

    overdueRecordIds.forEach((id) => processingRef.current.add(id));

    void Promise.allSettled(
      overdueRecordIds.map((intakeRecordId) =>
        intakeRoutineApi.updateIntakeRecordStatus(intakeRecordId, { status: 'MISSED' }),
      ),
    )
      .then(() => refetch())
      .finally(() => {
        overdueRecordIds.forEach((id) => processingRef.current.delete(id));
      });
  }, [schedule, isPending, isError, now, refetch]);

  return (
    <ScreenContainer
      contentContainerStyle={{
        paddingHorizontal: 0,
        paddingTop: topPadding,
        paddingBottom: 0,
      }}
    >
        <View style={{ paddingHorizontal: horizontalPadding }}>
          <View
            className="flex-row items-center justify-between"
            style={{ minHeight: scaleByWidth(width, 54, { min: 50, max: 60 }) }}
          >
            <View className="flex-row items-center">
              <SvgXml xml={DDOYA_LOGO_XML} width={126} height={54} />
            </View>
            <Pressable
              onPress={() => router.push('/notifications' as never)}
              hitSlop={10}
              className="h-10 w-10 items-center justify-center rounded-full"
              style={({ pressed }) => [
                neuRaised(999, colors.surface),
                {
                  opacity: pressed ? 0.82 : 1,
                },
              ]}
            >
              <AppIcon icon={Bell} size={20} color={colors.iconMuted} strokeWidth={2.5} />
              {unreadCount > 0 && (
                <View
                  className="absolute -right-0.5 -top-0.5 min-w-[18px] items-center rounded-full px-1 py-[1px]"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-[10px] font-scdream-medium text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
          <View className="mt-2.5" style={{ height: 3 }}>
            <View style={{ height: 1, backgroundColor: `${colors.shadowDark}22` }} />
            <View style={{ height: 1, backgroundColor: `${colors.shadowLight}CC` }} />
          </View>

          <TodayRoutineHeroCard
            className="mt-2"
            timeSlots={timeSlots}
            isPending={isPending}
            isError={isError}
          />

          {/* 날짜 바 (좌우 여백 없이 구분선 느낌) */}
          <View
            className="mb-2 items-center justify-center"
            style={{
              marginHorizontal: -horizontalPadding,
              height: dateBarHeight,
              backgroundColor: 'transparent',
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: `${colors.shadowDark}18`,
            }}
          >
            <Text className="text-md font-scdream-medium" style={{ color: colors.textMuted }}>
              {monthDay} · {weekday}
            </Text>
          </View>

          <View className="gap-2">
        {isPending ? (
          <View className="items-center py-10">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : isError ? (
          <Pressable
            onPress={() => refetch()}
            className="rounded-[20px] px-4 py-6"
            style={neuInset(14, colors.surface)}
          >
            <Text className="text-center text-sm font-scdream" style={{ color: colors.textMuted }}>
              일별 스케줄을 불러오지 못했습니다. 탭하여 다시 시도
            </Text>
            {isRefetching && (
              <ActivityIndicator className="mt-3" color={colors.primary} />
            )}
          </Pressable>
        ) : slotCount === 0 ? (
          <Text className="px-1 text-sm font-scdream" style={{ color: colors.textMuted }}>
            오늘 등록된 섭취 일정이 없어요.
          </Text>
        ) : (
          timeSlots.map((slot) => (
            <HomeIntakeSlot
              key={slot.plannedAt}
              timeLabel={formatKoreanTime(slot.intakeTime)}
              intakeTime={slot.intakeTime}
              plannedAt={slot.plannedAt}
              now={now}
              items={slot.items}
              onPressCamera={(scheduleIds: number[]) =>
                router.push(`/intake-verify?scheduleIds=${encodeURIComponent(scheduleIds.join(','))}` as never)
              }
            />
          ))
        )}
          </View>
        </View>
    </ScreenContainer>
  );
}
