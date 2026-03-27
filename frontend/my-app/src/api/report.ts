import apiClient from './client';
import {
  ReportResponse,
  ReportCreateResponse,
  ReportIntakeTimingsSaveRequest,
  ReportIntakeTimingsSaveResponse,
} from '../types/report';
import { SuccessResponse } from '../types/types';

export const reportApi = {
  // 리포트 상세 조회 (GET /api/reports)
  getReport: () => 
    apiClient.get<ReportResponse>('/reports'),

  // 리포트 갱신 (POST /api/reports)
  updateReport: () => 
    apiClient.post<ReportCreateResponse>('/reports'),

  // 리포트 복용 시각 확정 저장 (PATCH /api/reports/{reportId}/intake-timings)
  saveIntakeTimings: (reportId: number, payload: ReportIntakeTimingsSaveRequest) =>
    apiClient.patch<ReportIntakeTimingsSaveResponse>(`/reports/${reportId}/intake-timings`, payload),

  // 추천 섭취 시간 변경 반영
  updateRecommendedTime: (userSupplementId: number, time: string) =>
    apiClient.patch<SuccessResponse<any>>(`/reports/${userSupplementId}.intake-timing`, { intakeTime: time }),
};
