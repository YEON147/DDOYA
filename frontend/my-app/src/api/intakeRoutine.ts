import apiClient from './client';
import {
  IntakeRoutineListResponse,
  IntakeRoutineDetailResponse,
  IntakeRoutineUpdateRequest,
  DailyIntakeScheduleResponse,
  DailyIntakeScheduleQuery,
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
};
