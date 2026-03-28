import { useRef, useState } from 'react';
import { View, TextInput, Text, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '../common/AppButton';
import { getLoginErrorMessage, useLoginMutation } from '@/hooks/useLoginMutation';
import { colors } from '@/constants/theme/colors';
import { neuInset } from '@/constants/theme/neumorphism';

export function LoginForm() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const loginMutation = useLoginMutation();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const isFormValid = loginId.trim() !== '' && password.trim() !== '';

  const handleLogin = () => {
    setErrorMessage('');
    loginMutation.mutate(
      { loginId, password },
      {
        onSuccess: () => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 280,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: -12,
              duration: 280,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start(() => {
            router.replace('/(tabs)/(home)');
          });
        },
        onError: (error) => {
          console.error('Login failed:', error);
          setErrorMessage(getLoginErrorMessage(error));
        },
      }
    );
  };

  return (
    <Animated.View
      className="flex-1 w-full px-6 pb-6 items-center"
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      <View className="w-full max-w-[340px]">
        <View className="gap-3">
          <View className="px-4" style={neuInset(16)}>
            <TextInput
              className="w-full h-[52px] text-base font-scdream"
              style={{ color: colors.text, letterSpacing: 0.65 }}
              placeholder="아이디를 입력해주세요"
              placeholderTextColor={colors.textMuted}
              value={loginId}
              onChangeText={(text) => {
                setLoginId(text);
                setErrorMessage('');
              }}
              autoCapitalize="none"
            />
          </View>
          <View className="px-4" style={neuInset(16)}>
            <TextInput
              className="w-full h-[52px] text-base font-scdream"
              style={{ color: colors.text, letterSpacing: 0.65 }}
              placeholder="비밀번호를 입력해주세요"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMessage('');
              }}
              secureTextEntry
            />
          </View>

          <View className="min-h-[16px] justify-center mt-1 ml-1">
            {errorMessage ? (
              <Text className="text-red-500 text-xs ml-1 font-scdream">{errorMessage}</Text>
            ) : null}
          </View>
        </View>

        <View className="items-center mt-3 mb-4">
          <Text className="text-md mb-1 font-scdream" style={{ color: colors.textMuted }}>
            계정이 없으신가요 ?
          </Text>
          <Text
            className="font-scdream text-sm"
            style={{ color: colors.text }}
            onPress={() => router.push('/(auth)/signup')}
          >
            회원가입
          </Text>
        </View>
      </View>

      <View className="w-full max-w-[340px] mt-auto">
        <AppButton
          title="로그인"
          variant={isFormValid ? 'primary' : 'disabled'}
          onPress={handleLogin}
          disabled={!isFormValid}
          className="w-full h-[56px]"
        />
      </View>
    </Animated.View>
  );
}
