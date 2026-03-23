// axios/fetch 클라이언트 설정
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
  
const apiClient = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
      },
});

// 요청 인터셉터 (토큰 자동 첨부)
apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken; // 나중에 스토어에서 가져오도록
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // FormData(multipart): 인스턴스 기본 application/json 이 남으면 본문이 깨짐.
    // Content-Type 을 비워 두어야 RN/axios 가 boundary 포함 multipart 로 보냄.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
      } else {
        delete (config.headers as Record<string, unknown>)['Content-Type'];
      }
    }

    return config;
  });

  // 응답 인터셉터 (에러 공통 처리)
apiClient.interceptors.response.use(
    (response) => response,
    (err) => {
      if (err.response?.status === 401) {
        useAuthStore.getState().clearToken()
        // 토큰 만료 처리
      }
      return Promise.reject(err);
    }
  );
  
  export default apiClient;