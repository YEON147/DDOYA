import React, { useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '../common/AppButton';
import { useSignupStore } from '../../store/signupStore';
import { SignupStep1Input } from '../../types/types';

export const SignupForm = () => {
  const savedStep1 = useSignupStore((state) => state.step1);
  const setStep1 = useSignupStore((state) => state.setStep1);

  const [formData, setFormData] = useState<SignupStep1Input>(savedStep1);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (fieldName: keyof SignupStep1Input, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setErrorMessage('');
  };

  const handleSubmit = () => {
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
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
          <TextInput
            className="w-full h-[52px] bg-white border border-black rounded-xl px-4 text-sm font-scdream"
            placeholder="이메일을 입력해주세요"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View className="relative">
            <TextInput
              className="w-full h-[52px] bg-white border border-black rounded-xl px-4 text-sm font-scdream"
              placeholder="비밀번호를 입력해주세요"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
            />
            <Text className="absolute right-4 top-4" onPress={() => setShowPassword((prev) => !prev)}>
              {showPassword ? '👀' : '🙈'}
            </Text>
          </View>

          <TextInput
            className="w-full h-[52px] bg-white border border-black rounded-xl px-4 text-sm font-scdream"
            placeholder="비밀번호를 확인해주세요"
            value={formData.confirmPassword}
            onChangeText={(text) => handleInputChange('confirmPassword', text)}
            secureTextEntry={!showPassword}
          />

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