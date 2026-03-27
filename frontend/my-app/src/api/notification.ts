import apiClient from './client';
import { SuccessResponse } from '../types/types';
import { Platform } from 'react-native';

/**
 * 알림 관련 API 명세
 * - 다른 API(auth.ts, supplement.ts 등)와 동일하게 apiClient를 사용하여 작성했습니다.
 */
export const notificationApi = {
  /** 디바이스 푸시 토큰 등록 */
  registerToken: (fcmToken: string) => {
    return apiClient.post('/notifications/tokens', {
      fcmToken: fcmToken,
      deviceType: Platform.OS.toUpperCase()
    });
  },

  /** 디바이스 푸시 토큰 해제 */
  deactivateToken: (fcmToken: string) => {
    return apiClient.delete('/notifications/tokens', { data: { fcmToken: fcmToken } });
  },

  /**
   * 사용자 알림 설정 조회
   * GET /api/notification-settings
   */
  getNotificationSettings: () => {
    return apiClient.get<SuccessResponse<NotificationSettings>>('/notification-settings');
  },

  /** 섭취 알림 토글 (PATCH /api/notification-settings/intake) */
  updateIntakeNotificationSetting: (enabled: boolean) => {
    return apiClient.patch<SuccessResponse<NotificationSettings>>('/notification-settings/intake', { enabled });
  },

  /** 재고 알림 토글 (PATCH /api/notification-settings/stock) */
  updateStockNotificationSetting: (enabled: boolean) => {
    return apiClient.patch<SuccessResponse<NotificationSettings>>('/notification-settings/stock', { enabled });
  },

  /** 챙김 알림 토글 (PATCH /api/notification-settings/carry) */
  updateCarryNotificationSetting: (enabled: boolean) => {
    return apiClient.patch<SuccessResponse<NotificationSettings>>('/notification-settings/carry', { enabled });
  },

  /** 챙김 알림 시각 조회 (GET /api/notification-settings/carry-time) */
  getCarryNotificationTime: () => {
    return apiClient.get<SuccessResponse<{ carry_notification_time: string }>>('/notification-settings/carry-time');
  },

  /** 챙김 알림 시각 설정 (PATCH /api/notification-settings/carry-time) */
  updateCarryNotificationTime: (carryNotificationTime: string) => {
    return apiClient.patch<SuccessResponse<{ carry_notification_time: string }>>('/notification-settings/carry-time', { carry_notification_time: carryNotificationTime });
  },
};

/** 알림 설정 타입 정의 */
export interface NotificationSettings {
  intakeNotificationEnabled: boolean;  // 섭취 알림
  stockNotificationEnabled: boolean;   // 재고 알림 (전체)
  carryNotificationEnabled: boolean;   // 챙김 알림
}
