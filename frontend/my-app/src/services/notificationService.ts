import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { notificationApi } from '../api/notification';

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

    // 1. 물리 디바이스인지 확인 (에뮬레이터/시뮬레이터에서는 푸시 알림이 제한적일 수 있음)
    if (!Device.isDevice) {
      console.log('푸시 알림은 물리 디바이스에서만 가능합니다.');
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
      console.log('알림 권한을 얻지 못했습니다.');
      return null;
    }

    // 3. 토큰 획득 (Actual FCM/APNs token)
    // projectId는 app.json의 expo.extra.eas.projectId에서 가져오거나 수동으로 입력합니다.
    try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        token = (await Notifications.getDevicePushTokenAsync()).data;
        console.log('획득한 디바이스 토큰:', token);
    } catch (e) {
        console.error('토큰 획득 실패:', e);
    }

    // 4. Android용 채널 설정 (필수)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
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
        console.log('서버에 토큰 등록 완료');
      }
    } catch (error) {
      console.error('서버 토큰 동기화 오류:', error);
    }
  },

  /**
   * 로그아웃 시 토큰 비활성화
   */
  deactivateTokenOnServer: async (token: string) => {
    try {
      await notificationApi.deactivateToken(token);
      console.log('서버 토큰 비활성화 완료');
    } catch (error) {
      console.error('토큰 비활성화 오류:', error);
    }
  }
};
