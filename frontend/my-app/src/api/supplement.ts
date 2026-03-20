import apiClient from './client';
import type { SupplementCreateRequest } from '../types/supplement';

export const supplementApi = {
    // 영양제 등록
    createSupplement: (data: SupplementCreateRequest) =>
        apiClient.post('/supplements', data),

    // 영양제 목록 조회 
    getSupplements: (page: number, size: number=10) => 
        apiClient.get('/supplements', { params: { page, size } }),

    // 영양제 상세 조회
    getSupplementById: (id: number) =>
        apiClient.get(`/supplements/${id}`),

    // 영양제 수정
    updateSupplement: (id: number, data: SupplementCreateRequest) =>
        apiClient.put(`/supplements/${id}`, data),

    // 영양제 삭제
    deleteSupplement: (id: number) =>
        apiClient.delete(`/supplements/${id}`),
}