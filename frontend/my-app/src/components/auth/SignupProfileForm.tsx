import React, { useState } from 'react';
import { View, TextInput, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '../common/AppButton';
import { authApi } from '../../api/auth';
import { useSignupStore } from '../../store/signupStore';
import { SignupStep2Input } from '../../types/types';

export function SignupProfileForm() {
  const step2 = useSignupStore((state) => state.step2);
  const buildPayload = useSignupStore((state) => state.buildPayload);
  const reset = useSignupStore((state) => state.reset);

  const [nickname, setNickname] = useState(step2.nickname);
  const [gender, setGender] = useState(step2.gender);
  const [birthDate, setBirthDate] = useState(step2.birthDate);
  const [heightCm, setHeightCm] = useState(step2.heightCm ? String(step2.heightCm) : '');
  const [weightKg, setWeightKg] = useState(step2.weightKg ? String(step2.weightKg) : '');
  const [errorMessage, setErrorMessage] = useState('');

  const isFormValid =
    nickname.trim() !== '' &&
    gender.trim() !== '' &&
    birthDate.trim() !== '' &&
    heightCm.trim() !== '' &&
    weightKg.trim() !== '';

  const handleSubmit = async () => {
    const payload = { ...buildPayload(), ...step2 };
    const parsedHeight = Number(heightCm);
    const parsedWeight = Number(weightKg);
    console.log('전송 데이터:', JSON.stringify(payload));
    if (!isFormValid || Number.isNaN(parsedHeight) || Number.isNaN(parsedWeight)) {
      setErrorMessage('모든 값을 올바르게 입력해주세요.');
      return;
    }

    const step2Data: SignupStep2Input = {
      nickname: nickname.trim(),
      gender: gender.trim(),
      birthDate: birthDate.trim(),
      heightCm: parsedHeight,
      weightKg: parsedWeight,
    };

    try {
      await authApi.signup({ ...buildPayload(), ...step2Data });
      Alert.alert('회원가입 완료');
      reset();
      router.replace('/(auth)/login');
    } catch (error) {
      setErrorMessage('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <View className="flex-1 w-full px-6 pb-6 items-center">
      <View className="w-full max-w-[340px]">
        <View className="gap-3">
          <TextInput
            className="w-full h-[52px] bg-white border border-black rounded-xl px-4 text-sm font-scdream"
            placeholder="닉네임을 입력해주세요"
            value={nickname}
            onChangeText={(text) => {
              setNickname(text);
              setErrorMessage('');
            }}
          />
          <TextInput
            className="w-full h-[52px] bg-white border border-black rounded-xl px-4 text-sm font-scdream"
            placeholder="성별을 입력해주세요 (예: M/F)"
            value={gender}
            onChangeText={(text) => {
              setGender(text);
              setErrorMessage('');
            }}
          />
          <TextInput
            className="w-full h-[52px] bg-white border border-black rounded-xl px-4 text-sm font-scdream"
            placeholder="생년월일을 입력해주세요 (YYYY-MM-DD)"
            value={birthDate}
            onChangeText={(text) => {
              setBirthDate(text);
              setErrorMessage('');
            }}
          />
          <TextInput
            className="w-full h-[52px] bg-white border border-black rounded-xl px-4 text-sm font-scdream"
            placeholder="키(cm)를 입력해주세요"
            keyboardType="numeric"
            value={heightCm}
            onChangeText={(text) => {
              setHeightCm(text);
              setErrorMessage('');
            }}
          />
          <TextInput
            className="w-full h-[52px] bg-white border border-black rounded-xl px-4 text-sm font-scdream"
            placeholder="몸무게(kg)를 입력해주세요"
            keyboardType="numeric"
            value={weightKg}
            onChangeText={(text) => {
              setWeightKg(text);
              setErrorMessage('');
            }}
          />
          <View className="min-h-[16px] justify-center mt-1 ml-1">
            {errorMessage ? (
              <Text className="text-red-500 text-xs ml-1 font-scdream">{errorMessage}</Text>
            ) : null}
          </View>
        </View>

        <AppButton
          title="회원가입 완료"
          variant={isFormValid ? 'primary' : 'disabled'}
          onPress={handleSubmit}
          disabled={!isFormValid}
          className="w-full h-[56px] mt-4"
        />
      </View>
    </View>
  );
}
