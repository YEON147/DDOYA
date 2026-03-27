import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Plus } from 'lucide-react-native';
import type { SupplementSummaryDto } from '@/src/types/types';
import { useSupplementsList } from '@/hooks/useSupplement';
import { useReport } from '@/hooks/useReport';
import { useAuthStore } from '@/src/store/authStore';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { AppIcon } from '@/src/components/common/AppIcon';
import { getBodyPartImageSource } from '@/constants/bodyPartImages';
import { ReportStatusBanner } from '@/src/components/supplement/ReportStatusBanner';

export default function SupplementsScreen() {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydratedFromStorage);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data, isLoading, isError, refetch, isRefetching } = useSupplementsList();
  const { data: report } = useReport();
  const supplements = data?.supplements ?? [];
  const [failedImageIds, setFailedImageIds] = React.useState<Record<number, true>>({});
  
  const showReportBanner = React.useMemo(() => {
    if (!report || !data?.supplements) return false;

    // 현재 등록된 영양제 ID 목록
    const currentIds = (data.supplements as any[])
      .map((s: any) => s.userSupplementId)
      .sort((a: number, b: number) => a - b)
      .join(',');

    // 최근 리포트에 포함된 영양제 ID 목록
    const recommendations = report.timing_recommendations || report.timingRecommendations || [];
    const reportedIds = recommendations
      .map((r: any) => r.user_supplement_id || r.userSupplementId)
      .sort((a: number, b: number) => a - b)
      .join(',');

    // ID 목록이 다르면 변동이 있는 것으로 판단
    return currentIds !== reportedIds;
  }, [report, data?.supplements]);

  const accentPairs = [
    ['#FF8A80', '#FFD6DC'],
    ['#76B8FF', '#FFE18A'],
    ['#F5A3D3', '#F5C05D'],
    ['#79D1C5', '#B7E37F'],
    ['#9BA7FF', '#FFD6A8'],
  ] as const;

  const renderItem = ({ item, index }: { item: SupplementSummaryDto; index: number }) => (
    <TouchableOpacity
      onPress={() => router.push(`/supplements/${item.userSupplementId}`)}
      activeOpacity={0.65}
      className="mb-3 rounded-[22px]"
      style={[styles.card, { paddingHorizontal: 18, paddingVertical: 18 }]}
    >
      <View className="flex-row items-start justify-between">
        <Text className="text-sm font-scdream-medium leading-4" style={{ color: colors.textMuted }}>
          {`No.${index + 1}`}
        </Text>
        <AppIcon icon={ChevronRight} size={18} color={colors.textMuted} />
      </View>

      <View
        className="mt-2.5 items-center justify-center overflow-hidden rounded-2xl"
        style={{ backgroundColor: colors.input, borderWidth: 1, borderColor: `${colors.shadowDark}30`, height: 132 }}
      >
        {item.pillImageUrl?.trim() && !failedImageIds[item.userSupplementId] ? (
          <Image
            source={{ uri: item.pillImageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() =>
              setFailedImageIds((prev) => ({ ...prev, [item.userSupplementId]: true }))
            }
          />
        ) : (
          <Image
            source={getBodyPartImageSource(item.bodyPartId)}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        )}
      </View>

      <View className="mt-3">
        <Text
          className="text-[17px] font-scdream-medium leading-6 pb-2"
          style={{ color: colors.text }}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.alias}
        </Text>
        <Text
          className="text-sm font-scdream leading-5"
          style={{ color: colors.textMuted, minHeight: 20 }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {(item.primaryIngredientNames ?? []).filter(Boolean).join(' · ') || '성분 정보 없음'}
        </Text>
        <Text
          className="text-sm font-scdream leading-5"
          style={{ color: colors.textMuted }}
          numberOfLines={1}
        >
          {`재고 ${item.stockQuantity}정`}
        </Text>
      </View>

      <View className="mt-auto pt-3">
        <View
          className="h-6 w-[54px] flex-row overflow-hidden rounded-full"
          style={{ borderWidth: 1, borderColor: `${colors.shadowDark}33` }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: accentPairs[item.userSupplementId % accentPairs.length][0],
            }}
          />
          <View
            style={{
              flex: 1,
              backgroundColor: accentPairs[item.userSupplementId % accentPairs.length][1],
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer scrollable={false} padding={0}
      header={
        <TopHeader
          // title="영양제 관리"
          title=""
          right={
            <TouchableOpacity
              onPress={() => router.push('/supplements/create')}
              activeOpacity={0.9}
              style={[
                neuRaised(999, colors.primary),
                { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
              ]}
            >
              <AppIcon icon={Plus} size={22} color="white" />
            </TouchableOpacity>
          }
        />
      }
    >
      {!hasHydrated ? (
        <View className="flex-1 items-center justify-center pt-24">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !accessToken ? (
        <View className="flex-1 items-center justify-center gap-3 px-6 pt-20">
          <Text className="text-center text-[16px] font-scdream" style={{ color: colors.textMuted }}>
            로그인 후 영양제 목록을 불러올 수 있습니다.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/login')}
            className="rounded-full px-5 py-2.5"
            style={neuRaised(999, colors.surface)}
          >
            <Text className="text-[16px] font-scdream-medium" style={{ color: colors.primary }}>
              로그인하기
            </Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center pt-24">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center gap-3 px-6 pt-20">
          <Text className="text-center text-[16px] font-scdream" style={{ color: colors.textMuted }}>
            목록을 불러오지 못했습니다.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="rounded-full px-5 py-2.5"
            style={neuRaised(999, colors.surface)}
          >
            <Text className="text-[16px] font-scdream-medium" style={{ color: colors.primary }}>
              다시 시도
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={supplements}
          keyExtractor={(item) => item.userSupplementId.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-[16px] font-scdream" style={{ color: colors.textMuted }}>
                등록된 영양제가 없습니다.
              </Text>
            </View>
          }
          contentContainerClassName="pb-10"
          contentContainerStyle={[
            styles.listContent,
            supplements.length === 0 ? { flexGrow: 1 } : undefined,
          ]}
        />
      )}

      {showReportBanner && (
        <ReportStatusBanner 
          onPress={() => router.push({
            pathname: '/reports',
            params: { mode: 'edit', from: 'banner' }
          })} 
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  card: {
    ...neuRaised(22, colors.surface),
    width: '48.5%',
    minHeight: 296,
    justifyContent: 'flex-start',
  },
  row: {
    justifyContent: 'space-between',
  },
});
