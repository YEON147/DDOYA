import React, { useState, type ReactNode } from 'react';
import { View, TextInput, Text, Pressable, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { CalendarDays } from 'lucide-react-native';
import { AppButton } from '../common/AppButton';
import { useSignupStore } from '../../store/signupStore';
import { SignupStep2Input } from '../../types/types';
import { getSignupErrorMessage, useSignupMutation } from '@/hooks/useSignupMutation';
import { colors } from '@/constants/theme/colors';
import { neuInset } from '@/constants/theme/neumorphism';
import { AppIcon } from '@/src/components/common/AppIcon';
import { appAlert } from '@/src/utils/appAlert';

export function SignupProfileForm() {
  const step1 = useSignupStore((state) => state.step1);
  const step2 = useSignupStore((state) => state.step2);
  const buildPayload = useSignupStore((state) => state.buildPayload);
  const reset = useSignupStore((state) => state.reset);

  const [nickname, setNickname] = useState(step2.nickname);
  const [gender, setGender] = useState(
    step2.gender === 'FEAMALE' ? 'FEMALE' : step2.gender
  );
  const [birthDate, setBirthDate] = useState(step2.birthDate);
  const [heightCm, setHeightCm] = useState(step2.heightCm ? String(step2.heightCm) : '');
  const [weightKg, setWeightKg] = useState(step2.weightKg ? String(step2.weightKg) : '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempBirthDate, setTempBirthDate] = useState<Date>(() => {
    if (step2.birthDate) {
      const parsed = new Date(step2.birthDate);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return new Date(2000, 0, 1);
  });
  const signupMutation = useSignupMutation();
  const isMaleSelected = gender === 'MALE';
  const isFemaleSelected = gender === 'FEMALE';

  const isFormValid =
    nickname.trim() !== '' &&
    gender.trim() !== '' &&
    birthDate.trim() !== '' &&
    heightCm.trim() !== '' &&
    weightKg.trim() !== '';

  const handleSubmit = () => {
    const parsedHeight = Number(heightCm);
    const parsedWeight = Number(weightKg);

    if (!step1.email.trim() || !step1.password.trim() || !step1.confirmPassword.trim()) {
      setErrorMessage('이전 단계 정보가 없습니다. 다시 입력해주세요.');
      router.replace('/(auth)/signup');
      return;
    }

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

    const requestPayload = { ...buildPayload(), ...step2Data };
    setErrorMessage('');
    signupMutation.mutate(requestPayload, {
      onSuccess: () => {
        appAlert('회원가입 완료');
        reset();
        router.replace('/(auth)/login');
      },
      onError: (error) => {
        console.log('회원가입 API 실패:', error);
        setErrorMessage(getSignupErrorMessage(error));
      },
    });
  };

  const formatBirthDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const openBirthDatePicker = () => {
    if (birthDate) {
      const parsed = new Date(birthDate);
      if (!Number.isNaN(parsed.getTime())) setTempBirthDate(parsed);
    }
    setIsDatePickerOpen((prev) => !prev);
  };

  const handleBirthDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (!selectedDate) return;
    setTempBirthDate(selectedDate);
    setBirthDate(formatBirthDate(selectedDate));
    setErrorMessage('');
    if (Platform.OS === 'android') {
      setIsDatePickerOpen(false);
    }
  };

  const inputShell = (child: ReactNode) => (
    <View className="px-4" style={neuInset(16)}>
      {child}
    </View>
  );

  return (
    <View className="flex-1 w-full px-6 pb-6 items-center">
      <View className="w-full max-w-[340px]">
        <View className="gap-3">
          {inputShell(
            <TextInput
              className="h-[52px] w-full text-sm font-scdream"
              style={{ color: colors.text }}
              placeholderTextColor={colors.textMuted}
              placeholder="닉네임을 입력해주세요"
              value={nickname}
              onChangeText={(text) => {
                setNickname(text);
                setErrorMessage('');
              }}
            />
          )}
          <View className="flex-row gap-2 px-1">
            <TouchableOpacity
              activeOpacity={0.86}
              className="h-[52px] flex-1 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: isMaleSelected ? colors.point : colors.input,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isMaleSelected ? `${colors.point}CC` : `${colors.shadowDark}52`,
              }}
              onPress={() => {
                setGender('MALE');
                setErrorMessage('');
              }}
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
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isFemaleSelected ? `${colors.point}CC` : `${colors.shadowDark}52`,
              }}
              onPress={() => {
                setGender('FEMALE');
                setErrorMessage('');
              }}
            >
              <Text
                className="text-[16px] font-scdream-medium"
                style={{
                  color: isFemaleSelected ? '#FFFFFF' : colors.text,
                }}
              >
                여성
              </Text>
            </TouchableOpacity>
          </View>
          <Pressable onPress={openBirthDatePicker} className="px-4" style={neuInset(16)}>
            <View className="h-[52px] flex-row items-center justify-between">
              <Text
                className="text-sm font-scdream"
                style={{ color: birthDate ? colors.text : colors.textMuted }}
              >
                {birthDate || '생년월일을 선택해주세요'}
              </Text>
              <AppIcon icon={CalendarDays} size={16} color={colors.textMuted} />
            </View>
          </Pressable>
          {isDatePickerOpen && (
            <View className="px-4 pt-1">
              <View className="items-center rounded-2xl py-2" style={neuInset(16, colors.input)}>
                <DateTimePicker
                  value={tempBirthDate}
                  mode="date"
                  display="spinner"
                  onChange={handleBirthDateChange}
                  maximumDate={new Date()}
                  locale="ko-KR"
                  style={{ width: '100%', height: 180 }}
                  textColor={colors.text}
                />
              </View>
              {Platform.OS === 'ios' && (
                <View className="mt-2 flex-row justify-end">
                  <TouchableOpacity
                    className="rounded-xl px-4 py-2"
                    style={neuInset(12, colors.surface)}
                    onPress={() => setIsDatePickerOpen(false)}
                  >
                    <Text className="text-[16px] font-scdream-medium" style={{ color: colors.textMuted }}>
                      닫기
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          {inputShell(
            <View className="relative">
              <TextInput
                className="h-[52px] w-full pr-11 text-sm font-scdream"
                style={{ color: colors.text }}
                placeholderTextColor={colors.textMuted}
                placeholder="키를 입력해주세요"
                keyboardType="numeric"
                value={heightCm}
                onChangeText={(text) => {
                  setHeightCm(text);
                  setErrorMessage('');
                }}
              />
              <Text className="absolute right-1 top-[16px] text-[16px] font-scdream" style={{ color: colors.textMuted }}>
                cm
              </Text>
            </View>
          )}
          {inputShell(
            <View className="relative">
              <TextInput
                className="h-[52px] w-full pr-11 text-sm font-scdream"
                style={{ color: colors.text }}
                placeholderTextColor={colors.textMuted}
                placeholder="몸무게를 입력해주세요"
                keyboardType="numeric"
                value={weightKg}
                onChangeText={(text) => {
                  setWeightKg(text);
                  setErrorMessage('');
                }}
              />
              <Text className="absolute right-1 top-[16px] text-[16px] font-scdream" style={{ color: colors.textMuted }}>
                kg
              </Text>
            </View>
          )}
          <View className="min-h-[16px] justify-center mt-1 ml-1">
            {errorMessage ? (
              <Text className="text-red-500 text-xs ml-1 font-scdream">{errorMessage}</Text>
            ) : null}
          </View>
        </View>

        <AppButton
          title={signupMutation.isPending ? '처리 중…' : '회원가입 완료'}
          variant={isFormValid && !signupMutation.isPending ? 'primary' : 'disabled'}
          onPress={handleSubmit}
          disabled={!isFormValid || signupMutation.isPending}
          className="w-full h-[56px] mt-4"
        />
      </View>

    </View>
  );
}
