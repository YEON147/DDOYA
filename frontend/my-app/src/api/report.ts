import apiClient from './client';
import { ReportResponse, ReportCreateResponse } from '../types/report';
import { SuccessResponse } from '../types/types';

export const reportApi = {
  // 리포트 상세 조회 (GET /api/reports)
  getReport: () => 
    apiClient.get<ReportResponse>('/reports'),

  // 리포트 갱신 (POST /api/reports)
  updateReport: () => 
    apiClient.post<ReportCreateResponse>('/reports'),

  // 추천 섭취 시간 변경 반영
  updateRecommendedTime: (userSupplementId: number, time: string) =>
    apiClient.patch<SuccessResponse<any>>(`/reports/intake-times/${userSupplementId}`, { intakeTime: time }),
};
