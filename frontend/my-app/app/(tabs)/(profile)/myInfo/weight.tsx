import { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { colors } from '@/constants/theme/colors';
import { neuInset } from '@/constants/theme/neumorphism';
import { useUserProfileStore } from '@/src/store/userProfileStore';
import { AppButton } from '@/src/components/common/AppButton';

export default function MyInfoWeightScreen() {
  const weightKg = useUserProfileStore((s) => s.profile.weightKg);
  const setProfile = useUserProfileStore((s) => s.setProfile);
  const [value, setValue] = useState(String(weightKg ?? ''));
  const isValid = value.trim().length > 0 && !Number.isNaN(Number(value));

  const handleSave = () => {
    if (!isValid) {
      Alert.alert('몸무게', '몸무게를 입력해주세요.');
      return;
    }
    setProfile({ weightKg: Number(value) });
    router.back();
  };

  return (
    <ScreenContainer
      scrollable={false}
      padding={0}
      header={
        <TopHeader
          // title="몸무게 변경"
          title=""
        />
      }
    >
      <View className="flex-1 w-full items-center px-6 pb-6 pt-6">
        <View className="w-full max-w-[340px] flex-1">
          <Text className="mb-2 ml-1 text-[12px] font-scdream tracking-wide" style={{ color: colors.textMuted }}>
            몸무게 변경
          </Text>
          <View className="px-4" style={neuInset(16)}>
            <View className="relative">
              <TextInput
                className="h-[52px] w-full pr-11 text-[15px] font-scdream"
                style={{ color: colors.text }}
                placeholderTextColor={colors.textMuted}
                placeholder="몸무게를 입력해주세요"
                keyboardType="numeric"
                value={value}
                onChangeText={(text) => setValue(text.replace(/[^0-9.]/g, ''))}
              />
              <Text className="absolute right-1 top-[16px] text-[14px] font-scdream" style={{ color: colors.textMuted }}>
                kg
              </Text>
            </View>
          </View>
          <AppButton
            title="저장"
            variant={isValid ? 'primary' : 'disabled'}
            onPress={handleSave}
            disabled={!isValid}
            className="mt-auto h-[56px] w-full"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
