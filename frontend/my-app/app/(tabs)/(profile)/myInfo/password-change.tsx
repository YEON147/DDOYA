import { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { TopHeader } from '@/src/components/common/TopHeader';
import { colors } from '@/constants/theme/colors';
import { neuInset } from '@/constants/theme/neumorphism';
import { AppButton } from '@/src/components/common/AppButton';

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
      <View className="flex-1 w-full items-center px-6 pb-6 pt-6">
        <View className="w-full max-w-[340px] flex-1">
          <Text className="mb-2 ml-1 text-base font-scdream tracking-wide" style={{ color: colors.textMuted }}>
          비밀번호 변경
          </Text>

          <Text className="mb-2 ml-1 mt-1 text-sm font-scdream" style={{ color: colors.text }}>
            현재 비밀번호
          </Text>
          <View className="px-4" style={neuInset(16)}>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="현재 비밀번호를 입력해주세요"
              secureTextEntry
              placeholderTextColor={colors.textMuted}
              className="h-[52px] w-full text-sm font-scdream"
              style={{ color: colors.text }}
            />
          </View>

          <Text className="mb-2 ml-1 mt-5 text-sm font-scdream" style={{ color: colors.text }}>
            새로운 비밀번호
          </Text>
          <View className="px-4" style={neuInset(16)}>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="새로운 비밀번호를 입력해주세요"
              secureTextEntry
              placeholderTextColor={colors.textMuted}
              className="h-[52px] w-full text-sm font-scdream"
              style={{ color: colors.text }}
            />
          </View>
          <View className="mt-3 px-4" style={neuInset(16)}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="비밀번호 확인"
              secureTextEntry
              placeholderTextColor={colors.textMuted}
              className="h-[52px] w-full text-sm font-scdream"
              style={{ color: colors.text }}
            />
          </View>

          <AppButton title="저장" onPress={handleSave} className="mt-auto h-[56px] w-full" />
        </View>
      </View>
    </ScreenContainer>
  );
}
