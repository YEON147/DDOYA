// axios/fetch 클라이언트 설정
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import { tokenService } from './token';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

type RefreshResponseBody = {
  data?: {
    accessToken?: string;
    refreshToken?: string;
    access_token?: string;
    refresh_token?: string;
  };
};

let refreshPromise: Promise<string | null> | null = null;

function extractTokens(payload: RefreshResponseBody | undefined) {
  const data = payload?.data;
  const accessToken = data?.accessToken ?? data?.access_token ?? null;
  const refreshToken = data?.refreshToken ?? data?.refresh_token ?? null;
  return {
    accessToken: typeof accessToken === 'string' && accessToken.trim() !== '' ? accessToken : null,
    refreshToken: typeof refreshToken === 'string' && refreshToken.trim() !== '' ? refreshToken : null,
  };
}

// 요청 인터셉터 (토큰 자동 첨부)
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // 최신 RN(0.73+) + Axios(1.6+) 환경에서는 FormData 전송 시 Content-Type을 임의로 
  // 삭제하거나 강제 주입하면 'Network Error'가 발생하며 안드로이드 OkHttp가 전송을 거부할 수 있음.
  // 따라서 오리지널 Axios가 스스로 boundary를 포함한 헤더를 계산하도록 아무런 조작도 하지 않음.
  const data = config.data as unknown;
  const isFormDataLike =
    typeof FormData !== 'undefined' &&
    (data instanceof FormData ||
      (data != null && typeof (data as any).append === 'function'));

  if (isFormDataLike) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }

  return config;
});

// 응답 인터셉터 (에러 공통 처리)
apiClient.interceptors.response.use(
  (response) => response,
  async (err: AxiosError) => {
    const originalRequest = err.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!originalRequest || err.response?.status !== 401) {
      return Promise.reject(err);
    }

    const isRefreshRequest = (originalRequest.url ?? '').includes('/auth/refresh');
    if (originalRequest._retry || isRefreshRequest) {
      await useAuthStore.getState().clearToken();
      return Promise.reject(err);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const currentRefreshToken = await tokenService.getRefreshToken();
          if (!currentRefreshToken) return null;

          const refreshRes = await axios.post<RefreshResponseBody>(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken: currentRefreshToken },
            { timeout: 10000 },
          );

          const tokens = extractTokens(refreshRes.data);
          if (!tokens.accessToken) return null;

          const nickname = useAuthStore.getState().nickname;
          await useAuthStore.getState().setToken(tokens.accessToken, nickname);

          if (tokens.refreshToken) {
            await tokenService.saveRefreshToken(tokens.refreshToken);
          }

          return tokens.accessToken;
        })().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;
      if (!newAccessToken) {
        await useAuthStore.getState().clearToken();
        return Promise.reject(err);
      }

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      await useAuthStore.getState().clearToken();
      return Promise.reject(refreshError);
    }
  },
);

export default apiClient;