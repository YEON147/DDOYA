import apiClient from './client';
import { useAuthStore } from '../store/authStore';
import { Platform } from 'react-native';
import {
  IntakeRoutineListResponse,
  IntakeRoutineDetailResponse,
  IntakeRoutineUpdateRequest,
  DailyIntakeScheduleResponse,
  DailyIntakeScheduleQuery,
  IntakeCertificationRequest,
  IntakeCertificationResponse,
  IntakeRecordStatusUpdateRequest,
  IntakeRecordStatusUpdateResponse,
} from '../types/intakeRoutine';

export const intakeRoutineApi = {
  /** 섭취 시점별 설정한 섭취 시간 조회 */
  getSettings: () => 
    apiClient.get<IntakeRoutineListResponse>('/intake-timing-settings'),

  /** 특정 섭취 시점 시각 수정 */
  updateSetting: (id: number, data: IntakeRoutineUpdateRequest) => 
    apiClient.patch<IntakeRoutineDetailResponse>(`/intake-timing-settings/${id}`, data),

  /** 일별 섭취 스케줄 조회 (`date` 미입력 시 서버에서 오늘 기준) */
  getDailySchedule: (params?: DailyIntakeScheduleQuery) =>
    apiClient.get<DailyIntakeScheduleResponse>('/intake-schedules', { params }),

  /** 복용 인증 (이미지 + request JSON) */
  postIntakeCertification: async (formData: FormData): Promise<{ data: IntakeCertificationResponse }> => {
    try {
      const resp = await apiClient.post<IntakeCertificationResponse>('/intake-records/verify', formData);
      return { data: resp.data as IntakeCertificationResponse };
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 404) {
        // (구)스펙/게이트웨이에서 사용하는 경로 fallback
        const respFb = await apiClient.post<IntakeCertificationResponse>('/intake-certifications', formData);
        return { data: respFb.data as IntakeCertificationResponse };
      }
      throw e;
    }
  },

  /** 섭취 기록 상태 변경 (`MISSED` | `SKIPPED`) */
  updateIntakeRecordStatus: (intakeRecordId: number, payload: IntakeRecordStatusUpdateRequest) =>
    apiClient.patch<IntakeRecordStatusUpdateResponse>(`/intake-records/${intakeRecordId}/status`, payload),
};

export function buildIntakeCertificationFormData(
  imageUri: string,
  request: IntakeCertificationRequest,
  mimeType = 'image/jpeg',
): FormData {
  const fd = new FormData();
  const ext = mimeType.split('/')[1] || 'jpg';
  
  // 안드로이드 통신 에러 방지: URI가 file:// 로 시작하도록 강제
  let formattedUri = imageUri;
  if (Platform.OS === 'android' && !imageUri.startsWith('file://')) {
    formattedUri = `file://${imageUri}`;
  }

  console.log('[DEBUG] Intake Verify Upload URI (Android):', formattedUri);

  fd.append('image', {
    uri: formattedUri,
    type: mimeType,
    name: `intake-verify.${ext}`,
  } as any);
  fd.append('request', JSON.stringify(request));
  return fd;
}
