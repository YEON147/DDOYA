import apiClient from './client';
import { SuccessResponse } from '../types/types';
import { Platform } from 'react-native';

/**
 * 알림 관련 API 명세
 * - 다른 API(auth.ts, supplement.ts 등)와 동일하게 apiClient를 사용하여 작성했습니다.
 */
export const notificationApi = {
  /**
   * FCM/APNs 디바이스 토큰 등록
   * @param fcmToken 디바이스에서 발급받은 실제 토큰
   */
  registerToken: (fcmToken: string) => {
    // ERD에 따라 ANDROID 또는 IOS 타입을 실어서 보냅니다.
    const deviceType = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
    return apiClient.post<SuccessResponse<unknown>>('/notifications/tokens', {
      fcmToken,
      deviceType,
    });
  },

  /**
   * FCM 디바이스 토큰 비활성화 (로그아웃 시 호출)
   * @param fcmToken 비활성화할 토큰
   */
  deactivateToken: (fcmToken: string) => {
    return apiClient.delete<SuccessResponse<unknown>>('/notifications/tokens', {
      data: { fcmToken },
    });
  },

  /**
   * 사용자 알림 설정 조회
   * (user_notification_setting 테이블 기반)
   */
  getNotificationSettings: () => {
    return apiClient.get<SuccessResponse<NotificationSettings>>('/notifications/settings');
  },

  /**
   * 사용자 알림 설정 수정
   */
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => {
    return apiClient.patch<SuccessResponse<NotificationSettings>>('/notifications/settings', settings);
  },
};

/** 알림 설정 타입 정의 */
export interface NotificationSettings {
  intakeNotificationEnabled: boolean;  // 섭취 알림
  stockNotificationEnabled: boolean;   // 재고 알림 (전체)
  carryNotificationEnabled: boolean;   // 챙김 알림
}
