import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/src/api/auth';
import type { SignupRequest } from '@/src/types/types';
import { getBackendErrorMessage } from '@/hooks/apiErrorMessage';

export function useSignupMutation() {
  return useMutation({
    mutationFn: async (payload: SignupRequest) => {
      await authApi.signup(payload);
    },
  });
}

export function getSignupErrorMessage(error: unknown): string {
  return getBackendErrorMessage(error, '회원가입 처리 중 오류가 발생했습니다.');
}

