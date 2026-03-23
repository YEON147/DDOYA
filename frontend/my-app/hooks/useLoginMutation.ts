import { useMutation } from '@tanstack/react-query';
import { authApi, parseLoginResponse, type LoginResult } from '@/src/api/auth';
import { useAuthStore } from '@/src/store/authStore';
import { tokenService } from '@/src/api/token';
import { getBackendErrorMessage } from '@/hooks/apiErrorMessage';

type LoginVariables = { loginId: string; password: string };

export function useLoginMutation() {
  const setToken = useAuthStore((s) => s.setToken);

  return useMutation<LoginResult, unknown, LoginVariables>({
    mutationFn: async ({ loginId, password }) => {
      const res = await authApi.login(loginId.trim(), password);
      return parseLoginResponse(res);
    },
    onSuccess: async (data) => {
      if (data.refreshToken) {
        await tokenService.saveRefreshToken(data.refreshToken);
      }
      await setToken(data.accessToken, data.nickname);
    },
  });
}

export function getLoginErrorMessage(error: unknown): string {
  return getBackendErrorMessage(error, '로그인 처리 중 오류가 발생했습니다.');
}
