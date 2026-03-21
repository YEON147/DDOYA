import apiClient from './client';
import { 
    SupplementCreateRequest, 
    SupplementUpdateRequest,
    SuccessResponse,
    SupplementDetailResponse,
    SupplementUpdateResponse
} from '../types/types';

export const supplementApi = {
    // 영양제 등록
    createSupplement: (data: SupplementCreateRequest) =>
        apiClient.post('/supplements', data),

    // 영양제 목록 조회 
    getSupplements: (page: number, size: number=10) => 
        apiClient.get('/supplements', { params: { page, size } }),

    // 영양제 상세 조회
    getSupplementById: (id: number) =>
        apiClient.get<SuccessResponse<SupplementDetailResponse>>(`/supplements/${id}`),

    // 영양제 수정
    updateSupplement: (id: number, data: SupplementUpdateRequest) =>
        apiClient.patch<SuccessResponse<SupplementUpdateResponse>>(`/supplements/${id}`, data),

    // 영양제 삭제
    deleteSupplement: (id: number) =>
        apiClient.delete(`/supplements/${id}`),
};