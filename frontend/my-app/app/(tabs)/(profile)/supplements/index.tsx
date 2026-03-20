import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChevronRight } from 'lucide-react-native';
import { useSupplementStore } from '@/src/store/supplementStore';
import { colors } from '@/constants/theme/colors';
import { neuRaised } from '@/constants/theme/neumorphism';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';

export default function SupplementsScreen() {
  const router = useRouter();
  const { supplements } = useSupplementStore();

  const accentPairs = [
    ['#FF8A80', '#FFD6DC'],
    ['#76B8FF', '#FFE18A'],
    ['#F5A3D3', '#F5C05D'],
    ['#79D1C5', '#B7E37F'],
    ['#9BA7FF', '#FFD6A8'],
  ] as const;

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/supplements/${item.supplement_id}`)}
      activeOpacity={0.65}
      className="mb-3 rounded-[22px]"
      style={[styles.card, { paddingHorizontal: 18, paddingVertical: 18 }]}
    >
      <View className="flex-row items-start justify-between">
        <Text className="text-[10px] font-scdream leading-4" style={{ color: colors.textMuted }}>
          SUPPLEMENT CARD
        </Text>
        <ChevronRight size={18} color={colors.textMuted} />
      </View>

      <View
        className="mt-2.5 items-center justify-center rounded-2xl"
        style={{ backgroundColor: colors.input, borderWidth: 1, borderColor: `${colors.shadowDark}30`, aspectRatio: 1 }}
      >
        <Text className="text-[12px] font-scdream" style={{ color: colors.textMuted }}>
          Image
        </Text>
      </View>

      <View className="mt-3">
        <Text
          className="text-[16px] font-scdream-medium leading-5"
          style={{ color: colors.text }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          className="mt-1 text-[12px] font-scdream leading-4"
          style={{ color: colors.textMuted }}
          numberOfLines={1}
        >
          {item.primary_ingredient}
          {item.primary_ingredient ? ' · ' : ''}
          재고 {item.stock_quantity}
          {item.unit || '정'}
        </Text>
      </View>

      <View className="mt-3">
        <View
          className="h-6 w-[54px] flex-row overflow-hidden rounded-full"
          style={{ borderWidth: 1, borderColor: `${colors.shadowDark}33` }}
        >
          <View style={{ flex: 1, backgroundColor: accentPairs[item.supplement_id % accentPairs.length][0] }} />
          <View style={{ flex: 1, backgroundColor: accentPairs[item.supplement_id % accentPairs.length][1] }} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer scrollable={false} padding={0}
      header={
        <TopHeader
          title="영양제 관리"
          right={
            <TouchableOpacity
              onPress={() => router.push('/supplements/create')}
              activeOpacity={0.9}
              style={[
                neuRaised(999, colors.primary),
                { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
              ]}
            >
              <Ionicons name="add" size={22} color="white" />
            </TouchableOpacity>
          }
        />
      }
    >
      <FlatList
        data={supplements}
        keyExtractor={(item) => item.supplement_id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={renderItem}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="text-[14px] font-scdream" style={{ color: colors.textMuted }}>
              등록된 영양제가 없습니다.
            </Text>
          </View>
        }
        contentContainerClassName="pb-10"
        contentContainerStyle={styles.listContent}
      />
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
    aspectRatio: 0.68,
    justifyContent: 'space-between',
  },
  row: {
    justifyContent: 'space-between',
  },
});
