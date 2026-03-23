import type { AxiosResponse } from 'axios';
import apiClient from './client';
import { SignupRequest } from '../types/types';

/** 로그인 API 성공 응답에서 토큰·닉네임 추출 (필드명 제각각 대응) */
export type LoginResult = {
  accessToken: string;
  refreshToken: string | null;
  nickname: string | null;
};

export function parseLoginResponse(res: AxiosResponse): LoginResult {
  const payload = res.data?.data ?? res.data;
  const accessToken =
    payload?.accessToken ?? payload?.access_token ?? payload?.token;
  const refreshToken =
    payload?.refreshToken ?? payload?.refresh_token ?? null;
  const nicknameRaw =
    payload?.nickname ??
    payload?.nickName ??
    payload?.name ??
    payload?.memberNickname;
  const nickname =
    typeof nicknameRaw === 'string' && nicknameRaw.trim() !== ''
      ? nicknameRaw.trim()
      : null;

  if (typeof accessToken !== 'string' || accessToken.trim() === '') {
    throw new Error('로그인 응답에 accessToken이 없습니다.');
  }

  return {
    accessToken,
    refreshToken: typeof refreshToken === 'string' && refreshToken.trim() !== '' ? refreshToken : null,
    nickname,
  };
}

export const authApi = {
  signup: (data: SignupRequest) =>
    apiClient.post('/auth/signup', data),

  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  checkEmail: (email: string) =>
    apiClient.get('/auth/check-email', { params: { email } }),

  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),

  logout: () =>
    apiClient.post('/auth/logout'),
};