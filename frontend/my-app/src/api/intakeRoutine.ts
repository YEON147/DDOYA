import apiClient from './client';
import {
  IntakeRoutineListResponse,
  IntakeRoutineDetailResponse,
  IntakeRoutineUpdateRequest,
  DailyIntakeScheduleResponse,
  DailyIntakeScheduleQuery,
  IntakeCertificationRequest,
  IntakeCertificationResponse,
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
  postIntakeCertification: async (formData: FormData) => {
    try {
      return await apiClient.post<IntakeCertificationResponse>('/intake-records/verify', formData);
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 404) {
        // (구)스펙/게이트웨이에서 사용하는 경로 fallback
        return await apiClient.post<IntakeCertificationResponse>('/intake-certifications', formData);
      }
      throw e;
    }
  },
};

export function buildIntakeCertificationFormData(
  imageUri: string,
  request: IntakeCertificationRequest,
  mimeType = 'image/jpeg',
): FormData {
  const fd = new FormData();
  const ext = mimeType.split('/')[1] || 'jpg';
  fd.append('image', {
    uri: imageUri,
    type: mimeType,
    name: `intake-verify.${ext}`,
  } as any);
  fd.append('request', JSON.stringify(request));
  return fd;
}
