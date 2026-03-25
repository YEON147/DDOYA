import apiClient from './client';
import { ReportResponse } from '../types/report';
import { SuccessResponse } from '../types/types';

export const reportApi = {
  // 리포트 상세 조회
  getReport: () => 
    apiClient.get<ReportResponse>('/reports/latest'),

  // 리포트 갱신 (영양제 변동 시)
  updateReport: () => 
    apiClient.post<ReportResponse>('/reports/refresh'),

  // 추천 섭취 시간 변경 반영
  updateRecommendedTime: (userSupplementId: number, time: string) =>
    apiClient.patch<SuccessResponse<any>>(`/reports/intake-times/${userSupplementId}`, { intakeTime: time }),
};
