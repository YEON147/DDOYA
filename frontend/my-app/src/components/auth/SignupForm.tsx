import React, { useState } from 'react';
import { View, TextInput, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { AppButton } from '../common/AppButton';
import { useSignupStore } from '../../store/signupStore';
import { SignupStep1Input } from '../../types/types';
import { colors } from '@/constants/theme/colors';
import { neuInset } from '@/constants/theme/neumorphism';
import { authApi } from '@/src/api/auth';
import { getBackendErrorMessage } from '@/hooks/apiErrorMessage';
import { AppIcon } from '@/src/components/common/AppIcon';

export const SignupForm = () => {
  const savedStep1 = useSignupStore((state) => state.step1);
  const setStep1 = useSignupStore((state) => state.setStep1);

  const [formData, setFormData] = useState<SignupStep1Input>(savedStep1);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailCheckMessage, setEmailCheckMessage] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (fieldName: keyof SignupStep1Input, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setErrorMessage('');
    if (fieldName === 'email') {
      setIsEmailVerified(false);
      setEmailCheckMessage('');
    }
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleEmailCheck = async () => {
    const email = formData.email.trim();
    if (!isValidEmail(email)) {
      setIsEmailVerified(false);
      setEmailCheckMessage('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    try {
      setIsCheckingEmail(true);
      setErrorMessage('');
      await authApi.checkEmail(email);
      setIsEmailVerified(true);
      setEmailCheckMessage('사용 가능한 이메일입니다.');
    } catch (error) {
      setIsEmailVerified(false);
      setEmailCheckMessage(
        getBackendErrorMessage(error, '이미 사용 중인 이메일입니다.')
      );
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSubmit = () => {
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!isEmailVerified) {
      setErrorMessage('이메일 중복확인을 완료해주세요.');
      return;
    }
    setStep1(formData);
    router.push('/(auth)/signup-profile');
  };

  const isFormValid =
    formData.email.trim() !== '' &&
    formData.password.trim() !== '' &&
    formData.confirmPassword.trim() !== '';

  return (
    <View className="flex-1 w-full px-6 pb-6 items-center">
      <View className="w-full max-w-[340px]">
        <View className="gap-3">
          <View className="relative px-4 pr-[104px]" style={neuInset(16)}>
            <TextInput
              className="h-[52px] w-full text-sm font-scdream"
              style={{ color: colors.text }}
              placeholderTextColor={colors.textMuted}
              placeholder="이메일을 입력해주세요"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Pressable
              onPress={handleEmailCheck}
              disabled={isCheckingEmail}
              className="absolute right-2 top-1 h-[44px] min-w-[86px] items-center justify-center rounded-xl px-3"
              style={({ pressed }) => [
                neuInset(12, colors.surface),
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text
                className="text-[12px] font-scdream-medium"
                style={{ color: isCheckingEmail ? colors.textMuted : colors.text }}
              >
                {isCheckingEmail ? '확인 중...' : '중복확인'}
              </Text>
            </Pressable>
          </View>
          <View className="min-h-[16px] justify-center ml-1">
            {emailCheckMessage ? (
              <Text
                className="text-xs font-scdream"
                style={{ color: isEmailVerified ? '#16A34A' : '#DC2626' }}
              >
                {emailCheckMessage}
              </Text>
            ) : null}
          </View>
          <View className="relative px-4 pr-11" style={neuInset(16)}>
            <TextInput
              className="h-[52px] w-full text-sm font-scdream"
              style={{ color: colors.text }}
              placeholderTextColor={colors.textMuted}
              placeholder="비밀번호를 입력해주세요"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
            />
            <Pressable
              className="absolute right-3 top-3 h-7 w-7 items-center justify-center rounded-full"
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={8}
            >
              <AppIcon icon={showPassword ? Eye : EyeOff} size={16} color={colors.textMuted} />
            </Pressable>
          </View>

          <View className="px-4" style={neuInset(16)}>
            <TextInput
              className="h-[52px] w-full text-sm font-scdream"
              style={{ color: colors.text }}
              placeholderTextColor={colors.textMuted}
              placeholder="비밀번호를 확인해주세요"
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              secureTextEntry={!showPassword}
            />
          </View>

          <View className="min-h-[16px] justify-center mt-1 ml-1">
            {errorMessage ? (
              <Text className="text-red-500 text-xs ml-1 font-scdream">{errorMessage}</Text>
            ) : null}
          </View>
        </View>

        <AppButton
          title="다음"
          variant={isFormValid ? 'primary' : 'disabled'}
          onPress={handleSubmit}
          disabled={!isFormValid}
          className="w-full h-[56px] mt-4"
        />
      </View>
    </View>
  );
};
