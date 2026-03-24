import apiClient from './client';
import { 
  IntakeRoutineListResponse, 
  IntakeRoutineDetailResponse, 
  IntakeRoutineUpdateRequest 
} from '../types/intakeRoutine';

export const intakeRoutineApi = {
  /** 사용자의 전체 섭취 루틴 설정 조회 */
  getSettings: () => 
    apiClient.get<IntakeRoutineListResponse>('/intake-timing-settings'),

  /** 특정 섭취 시점 시각 수정 */
  updateSetting: (id: number, data: IntakeRoutineUpdateRequest) => 
    apiClient.patch<IntakeRoutineDetailResponse>(`/intake-timing-settings/${id}`, data),
};
