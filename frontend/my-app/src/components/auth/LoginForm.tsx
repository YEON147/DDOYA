import { useState } from 'react';
import { View, TextInput, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '../common/AppButton';
import { SocialLoginButtons } from './SocialLoginButtons';
import { authApi } from '@/src/api/auth';
import { useAuthStore } from '@/src/store/authStore';

export function LoginForm() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { setToken } = useAuthStore();

  const isFormValid = loginId.trim() !== '' && password.trim() !== '';

  const handleLogin = async () => {
    try {
      const res = await authApi.login(loginId, password);
      const payload = res.data?.data ?? res.data;
      const accessToken = payload?.accessToken;
      const nickname = payload?.nickname;

      if (typeof accessToken !== 'string' || accessToken.trim() === '') {
        throw new Error('로그인 응답에 accessToken이 없습니다.');
      }

      await setToken(accessToken, typeof nickname === 'string' ? nickname : null);
      setErrorMessage('');
      Alert.alert('로그인 완료');
      router.replace('/(tabs)/(home)');
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('로그인 처리 중 오류가 발생했습니다. 입력 정보 또는 서버 응답을 확인해주세요.');
    }
  };

  return (
    <View className="flex-1 w-full px-6 pb-6 items-center">
      <View className="w-full max-w-[340px]">
        <View className="gap-3">
          <TextInput
            className="w-full h-[52px] bg-white border border-black rounded-xl px-4 text-sm font-scdream"
            placeholder="아이디를 입력해주세요"
            value={loginId}
            onChangeText={(text) => {
              setLoginId(text);
              setErrorMessage('');
            }}
            autoCapitalize="none"
          />
          <TextInput
            className="w-full h-[52px] bg-white border border-black rounded-xl px-4 text-sm font-scdream"
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrorMessage('');
            }}
            secureTextEntry
          />

          {/* Error message area */}
          <View className="min-h-[16px] justify-center mt-1 ml-1">
            {errorMessage ? (
              <Text className="text-red-500 text-xs ml-1 font-scdream">{errorMessage}</Text>
            ) : null}
          </View>
        </View>

        <View className="items-center mt-3 mb-4">
          <Text className="text-[#a5a5a5] text-md mb-1 font-scdream">계정이 없으신가요 ?</Text>
          <Text
            className="text-black font-scdream text-sm"
            onPress={() => router.push('/(auth)/signup')}
          >
            회원가입
          </Text>
        </View>
      </View>

      {/* Push to bottom spacer */}
      <View className="w-full max-w-[340px] mt-auto">
        <AppButton
          title="로그인"
          variant={isFormValid ? 'primary' : 'disabled'}
          onPress={handleLogin}
          disabled={!isFormValid}
          className="w-full h-[56px]"
        />
      </View>
    </View>
  );
}
