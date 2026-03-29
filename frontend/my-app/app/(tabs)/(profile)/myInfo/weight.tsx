import { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { colors } from '@/constants/theme/colors';
import { neuInset } from '@/constants/theme/neumorphism';
import { useUserProfileStore } from '@/src/store/userProfileStore';
import { AppButton } from '@/src/components/common/AppButton';
import { appAlert } from '@/src/utils/appAlert';

export default function MyInfoWeightScreen() {
  const weightKg = useUserProfileStore((s) => s.profile.weightKg);
  const setProfile = useUserProfileStore((s) => s.setProfile);
  const [value, setValue] = useState(String(weightKg ?? ''));
  const isValid = value.trim().length > 0 && !Number.isNaN(Number(value));

  const handleSave = () => {
    if (!isValid) {
      appAlert('몸무게', '몸무게를 입력해주세요.');
      return;
    }
    setProfile({ weightKg: String(value) });
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
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={12}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 w-full items-center px-6 pb-6 pt-6">
            <View className="w-full max-w-[340px] flex-1">
              <Text className="mb-2 ml-1 text-sm font-scdream tracking-wide" style={{ color: colors.textMuted }}>
                몸무게 변경
              </Text>
              <View className="px-4" style={neuInset(16)}>
                <View className="relative">
                  <TextInput
                    className="h-[52px] w-full pr-11 text-sm font-scdream"
                    style={{ color: colors.text }}
                    placeholderTextColor={colors.textMuted}
                    placeholder="몸무게를 입력해주세요"
                    keyboardType="numeric"
                    value={value}
                    onChangeText={(text) => setValue(text.replace(/[^0-9.]/g, ''))}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                  <Text className="absolute right-1 top-[16px] text-sm font-scdream" style={{ color: colors.textMuted }}>
                    kg
                  </Text>
                </View>
              </View>
              <AppButton
                title="저장"
                variant={isValid ? 'primary' : 'disabled'}
                onPress={handleSave}
                disabled={!isValid}
                className="mt-auto mb-[10px] h-[56px] w-full"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
