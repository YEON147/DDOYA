import { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { colors } from '@/constants/theme/colors';
import { neuInset } from '@/constants/theme/neumorphism';
import { useUserProfileStore } from '@/src/store/userProfileStore';
import { AppButton } from '@/src/components/common/AppButton';

export default function MyInfoHeightScreen() {
  const heightCm = useUserProfileStore((s) => s.profile.heightCm);
  const setProfile = useUserProfileStore((s) => s.setProfile);
  const [value, setValue] = useState(String(heightCm ?? ''));
  const isValid = value.trim().length > 0 && !Number.isNaN(Number(value));

  const handleSave = () => {
    if (!isValid) {
      Alert.alert('키', '키를 입력해주세요.');
      return;
    }
    setProfile({ heightCm: Number(value) });
    router.back();
  };

  return (
    <ScreenContainer
      scrollable={false}
      padding={0}
      header={
        <TopHeader
          // title="키 변경"
          title=""
        />
      }
    >
      <View className="flex-1 w-full items-center px-6 pb-6 pt-6">
        <View className="w-full max-w-[340px] flex-1">
          <Text className="mb-2 ml-1 text-[12px] font-scdream tracking-wide" style={{ color: colors.textMuted }}>
            키 변경
          </Text>
          <View className="px-4" style={neuInset(16)}>
            <View className="relative">
              <TextInput
                className="h-[52px] w-full pr-11 text-[15px] font-scdream"
                style={{ color: colors.text }}
                placeholderTextColor={colors.textMuted}
                placeholder="키를 입력해주세요"
                keyboardType="numeric"
                value={value}
                onChangeText={(text) => setValue(text.replace(/[^0-9.]/g, ''))}
              />
              <Text className="absolute right-1 top-[16px] text-[14px] font-scdream" style={{ color: colors.textMuted }}>
                cm
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
