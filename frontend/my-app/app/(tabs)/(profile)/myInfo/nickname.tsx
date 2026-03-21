import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { colors } from '@/constants/theme/colors';
import { useUserProfileStore } from '@/src/store/userProfileStore';

export default function MyInfoNicknameScreen() {
  const nickname = useUserProfileStore((s) => s.profile.nickname);
  const setProfile = useUserProfileStore((s) => s.setProfile);
  const [value, setValue] = useState(nickname);

  const handleSave = () => {
    if (!value.trim()) {
      Alert.alert('닉네임', '닉네임을 입력해주세요.');
      return;
    }
    setProfile({ nickname: value.trim() });
    router.back();
  };

  return (
    <ScreenContainer scrollable={false} padding={0} header={<TopHeader title="닉네임 변경" />}>
      <View className="flex-1 px-6 pt-8">
        <Text className="mb-3 text-[13px] font-scdream" style={{ color: colors.text }}>
          닉네임
        </Text>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="닉네임을 입력해주세요"
          placeholderTextColor={colors.textMuted}
          className="rounded-2xl px-4 py-4 text-[15px] font-scdream"
          style={{ backgroundColor: colors.surfaceWarm, color: colors.text }}
        />

        <View className="mt-auto pb-8">
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            className="items-center rounded-full py-4"
            style={{ backgroundColor: colors.text }}
          >
            <Text className="text-[16px] font-scdream-medium" style={{ color: '#FFFFFF' }}>
              저장
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
