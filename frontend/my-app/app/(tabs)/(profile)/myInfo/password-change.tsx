import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { colors } from '@/constants/theme/colors';

export default function PasswordChangeScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('비밀번호', '비밀번호를 입력해주세요.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('비밀번호', '비밀번호가 일치하지 않습니다.');
      return;
    }
    Alert.alert('변경', '비밀번호 변경 API 호출 완료.');
  };

  return (
    <ScreenContainer
      scrollable={false}
      padding={0}
      header={
        <TopHeader
          // title="비밀번호 변경"
          title=""
        />
      }
    >
      <View className="flex-1 px-6 pt-8">
        <Text className="mb-2 ml-1 text-[12px] font-scdream tracking-wide" style={{ color: colors.textMuted }}>
          비밀번호 변경
        </Text>
        <Text className="mb-3 text-[13px] font-scdream" style={{ color: colors.text }}>
          현재 비밀번호
        </Text>
        <TextInput
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="현재 비밀번호를 입력해주세요"
          secureTextEntry
          placeholderTextColor={colors.textMuted}
          className="rounded-2xl px-4 py-4 text-[15px] font-scdream"
          style={{ backgroundColor: colors.surfaceWarm, color: colors.text }}
        />

        <Text className="mb-3 mt-7 text-[13px] font-scdream" style={{ color: colors.text }}>
          새로운 비밀번호
        </Text>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="새로운 비밀번호를 입력해주세요"
          secureTextEntry
          placeholderTextColor={colors.textMuted}
          className="rounded-2xl px-4 py-4 text-[15px] font-scdream"
          style={{ backgroundColor: colors.surfaceWarm, color: colors.text }}
        />
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="비밀번호 확인"
          secureTextEntry
          placeholderTextColor={colors.textMuted}
          className="mt-3 rounded-2xl px-4 py-4 text-[15px] font-scdream"
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
