import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { AppButton } from '@/src/components/common/AppButton';
import { useSupplementCreateStore } from '@/src/store/supplementCreateStore';
import {
  useCreateSupplementMutation,
  getCreateSupplementErrorMessage,
} from '@/hooks/useSupplementMutation';
import { colors } from '@/constants/theme/colors';
import { neuInset, neuRaised } from '@/constants/theme/neumorphism';

export default function SupplementConfirmScreen() {
  const router = useRouter();
  const ocrResult = useSupplementCreateStore((s) => s.ocrResult);
  const alias = useSupplementCreateStore((s) => s.alias);
  const capacityInput = useSupplementCreateStore((s) => s.capacityInput);
  const setAlias = useSupplementCreateStore((s) => s.setAlias);
  const setCapacityInput = useSupplementCreateStore((s) => s.setCapacityInput);
  const buildCreateRequest = useSupplementCreateStore((s) => s.buildCreateRequest);
  const reset = useSupplementCreateStore((s) => s.reset);

  const createMutation = useCreateSupplementMutation();

  useEffect(() => {
    if (!ocrResult) {
      router.replace('/(tabs)/(profile)/supplements/create');
    }
  }, [ocrResult, router]);

  if (!ocrResult) {
    return null;
  }

  const handleSave = () => {
    const payload = buildCreateRequest();
    if (!payload) {
      Alert.alert('입력 확인', '별칭과 총량(0보다 큰 숫자)을 입력해 주세요.');
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        reset();
        Alert.alert('완료', '영양제가 등록되었습니다.', [
          { text: '확인', onPress: () => router.replace('/(tabs)/(profile)/supplements') },
        ]);
      },
      onError: (error) => {
        Alert.alert('등록 실패', getCreateSupplementErrorMessage(error));
      },
    });
  };

  return (
    <ScreenContainer scrollable={false} padding={0} header={<TopHeader title="등록 확인" />}>
      <ScrollView className="flex-1 px-4 pt-2" keyboardShouldPersistTaps="handled">
        <Text className="text-base font-scdream-medium mb-2" style={{ color: colors.text }}>
          성분표 (OCR 결과)
        </Text>
        <View className="mb-4 p-3" style={neuRaised(18, colors.surface)}>
          <Text className="mb-1 text-sm font-scdream" style={{ color: colors.textMuted }}>
            부위: {ocrResult.bodyPartName} · 1일 권장 {ocrResult.dailyDose} · 1회 {ocrResult.dosePerIntake}
          </Text>
          {ocrResult.ingredients.map((ing) => (
            <Text
              key={`${ing.normalizedIngredientId}-${ing.rawName}`}
              className="py-1 text-sm font-scdream"
              style={{ color: colors.text }}
            >
              {ing.isPrimary ? '★ ' : '· '}
              {ing.normalizedName} {ing.amount}
              {ing.unit} ({ing.rawName})
            </Text>
          ))}
        </View>

        <Text className="text-base font-scdream-medium mb-2" style={{ color: colors.text }}>별칭</Text>
        <View className="mb-4 px-4" style={neuInset(16)}>
          <TextInput
            className="h-[52px] w-full text-sm font-scdream"
            style={{ color: colors.text }}
            placeholderTextColor={colors.textMuted}
            placeholder="예: 아침 비타민"
            value={alias}
            onChangeText={setAlias}
          />
        </View>

        <Text className="text-base font-scdream-medium mb-2" style={{ color: colors.text }}>총량</Text>
        <View className="mb-6 px-4" style={neuInset(16)}>
          <TextInput
            className="h-[52px] w-full text-sm font-scdream"
            style={{ color: colors.text }}
            placeholderTextColor={colors.textMuted}
            placeholder="예: 60 (정/캡슐 개수 등)"
            value={capacityInput}
            onChangeText={setCapacityInput}
            keyboardType="decimal-pad"
          />
        </View>

        {createMutation.isPending ? <ActivityIndicator className="my-4" /> : null}
        <AppButton
          title="저장하기"
          onPress={handleSave}
          disabled={createMutation.isPending}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
