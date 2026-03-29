import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import axios from 'axios';
import { notificationApi } from '../api/notification';
import { tokenService } from '../api/token';
import { useAuthStore } from '../store/authStore';

type RefreshPayload = {
  data?: {
    accessToken?: string;
    refreshToken?: string;
    access_token?: string;
    refresh_token?: string;
  };
};

function parseRefreshTokens(payload: RefreshPayload | undefined) {
  const data = payload?.data;
  const accessToken = data?.accessToken ?? data?.access_token ?? null;
  const refreshToken = data?.refreshToken ?? data?.refresh_token ?? null;
  return {
    accessToken: typeof accessToken === 'string' && accessToken.trim() !== '' ? accessToken : null,
    refreshToken: typeof refreshToken === 'string' && refreshToken.trim() !== '' ? refreshToken : null,
  };
}

/**
 * 알림 관련 핵심 로직을 담은 서비스 레이어입니다.
 * - 권한 요청, 토큰 발급 및 서버 등록 과정을 관리합니다.
 */
export const notificationService = {
  /**
   * 알림 권한을 요청하고 FCM/APNs 토큰을 획득합니다.
   * (React Native 공식 문서 및 Expo 가이드를 참고하여 작성했습니다.)
   */
  registerForPushNotificationsAsync: async () => {
    let token;

    // 0. 웹 환경은 Web Push(VAPID) 별도 설정이 필요하므로 우선 건너뜁니다.
    if (Platform.OS === 'web') {
      return null;
    }

    // 1. 물리 디바이스인지 확인 (에뮬레이터/시뮬레이터에서는 푸시 알림이 제한적일 수 있음)
    if (!Device.isDevice) {
      return null;
    }

    // 2. 기존 권한 확인 및 요청
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return null;
    }

    // 3. 토큰 획득 (Actual FCM/APNs token)
    // projectId는 app.json의 expo.extra.eas.projectId에서 가져오거나 수동으로 입력합니다.
    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      token = (await Notifications.getDevicePushTokenAsync()).data;
    } catch {
      // 토큰 획득 실패 시 null 반환 경로로 이어짐
    }

    // 4. Android용 채널 설정 (필수)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: '기본 알림',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        enableVibrate: true,
        showBadge: true,
      });
    }

    return token;
  },

  /**
   * 서버에 토큰 등록 시도
   */
  syncTokenWithServer: async () => {
    try {
      const token = await notificationService.registerForPushNotificationsAsync();
      if (token) {
        await notificationApi.registerToken(token);
      }
    } catch (error) {
      // 401이면 명시적으로 액세스 토큰 갱신 시도 후 1회 재시도
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        try {
          const token = await notificationService.registerForPushNotificationsAsync();
          if (!token) return;

          const currentRefreshToken = await tokenService.getRefreshToken();
          if (!currentRefreshToken) return;

          const refreshRes = await axios.post<RefreshPayload>(
            `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken: currentRefreshToken },
            { timeout: 10000 },
          );

          const tokens = parseRefreshTokens(refreshRes.data);
          if (!tokens.accessToken) return;

          const nickname = useAuthStore.getState().nickname;
          await useAuthStore.getState().setToken(tokens.accessToken, nickname);

          if (tokens.refreshToken) {
            await tokenService.saveRefreshToken(tokens.refreshToken);
          }

          await notificationApi.registerToken(token);
          return;
        } catch {
          // 갱신 실패는 로그인 만료 케이스이므로 조용히 무시
          return;
        }
      }
    }
  },

  /**
   * 로그아웃 시 토큰 비활성화
   */
  deactivateTokenOnServer: async (token: string) => {
    try {
      await notificationApi.deactivateToken(token);
    } catch {
      // 서버 비활성화 실패는 조용히 무시
    }
  }
};
