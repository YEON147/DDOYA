import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { colors } from '@/constants/theme/colors';
import { useUserProfileStore } from '@/src/store/userProfileStore';
import { AppButton } from '@/src/components/common/AppButton';

export default function MyInfoGenderScreen() {
  const gender = useUserProfileStore((s) => s.profile.gender);
  const setProfile = useUserProfileStore((s) => s.setProfile);
  const initial = gender === '남성' ? 'MALE' : gender === '여성' ? 'FEMALE' : gender;
  const [value, setValue] = useState(initial);
  const isMaleSelected = value === 'MALE';
  const isFemaleSelected = value === 'FEMALE';
  const isValid = isMaleSelected || isFemaleSelected;

  const handleSave = () => {
    if (!isValid) {
      Alert.alert('성별', '성별을 선택해주세요.');
      return;
    }
    setProfile({ gender: value === 'MALE' ? '남성' : '여성' });
    router.back();
  };

  return (
    <ScreenContainer
      scrollable={false}
      padding={0}
      header={
        <TopHeader
          // title="성별 변경"
          title=""
        />
      }
    >
      <View className="flex-1 w-full items-center px-6 pb-6 pt-6">
        <View className="w-full max-w-[340px] flex-1">
          <Text className="mb-2 ml-1 text-base font-scdream tracking-wide" style={{ color: colors.textMuted }}>
            성별 변경
          </Text>
          <View className="flex-row gap-2 px-1">
            <TouchableOpacity
              activeOpacity={0.86}
              className="h-[52px] flex-1 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: isMaleSelected ? colors.point : colors.input,
                borderWidth: 1,
                borderColor: isMaleSelected ? `${colors.point}CC` : `${colors.shadowDark}52`,
              }}
              onPress={() => setValue('MALE')}
            >
              <Text
                className="text-[16px] font-scdream-medium"
                style={{ color: isMaleSelected ? '#FFFFFF' : colors.text }}
              >
                남성
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.86}
              className="h-[52px] flex-1 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: isFemaleSelected ? colors.point : colors.input,
                borderWidth: 1,
                borderColor: isFemaleSelected ? `${colors.point}CC` : `${colors.shadowDark}52`,
              }}
              onPress={() => setValue('FEMALE')}
            >
              <Text
                className="text-[16px] font-scdream-medium"
                style={{ color: isFemaleSelected ? '#FFFFFF' : colors.text }}
              >
                여성
              </Text>
            </TouchableOpacity>
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
