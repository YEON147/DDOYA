import apiClient from './client';
import {
    SupplementCreateRequest,
    SupplementUpdateRequest,
    SuccessResponse,
    SupplementDetailResponse,
    SupplementListResponse,
    SupplementUpdateResponse,
    IngredientAnalyzePayload,
} from '../types/types';

/** `POST /api/supplements` — `pillImg` + `register`(JSON 문자열) */
export function buildSupplementRegisterFormData(
    pillUri: string,
    pillMimeType: string | null | undefined,
    register: SupplementCreateRequest
): FormData {
    const formData = new FormData();
    const lower = pillUri.toLowerCase();
    const name = lower.endsWith('.png')
        ? 'pill.png'
        : lower.endsWith('.webp')
          ? 'pill.webp'
          : 'pill.jpg';
    const type =
        pillMimeType ||
        (lower.endsWith('.png') ? 'image/png' : lower.endsWith('.webp') ? 'image/webp' : 'image/jpeg');
    formData.append('pillImg', { uri: pillUri, name, type } as unknown as Blob);
    formData.append('register', JSON.stringify(register));
    return formData;
}

export const supplementApi = {
    /** 성분표 이미지 OCR (서버가 FastAPI `/api/ai/ocr/analyze` 호출) — `ingredientsImg` 필드로 multipart 전송 */
    analyzeIngredientsOcr: (formData: FormData) =>
        apiClient.post<SuccessResponse<IngredientAnalyzePayload>>('/supplements/ingredients/ocr', formData, {
            timeout: 120000,
        }),

    /** 영양제 등록 — multipart (`pillImg`, `register` JSON 문자열). 서버는 `MULTIPART_FORM_DATA`만 허용 */
    createSupplementMultipart: (formData: FormData) =>
        apiClient.post<SuccessResponse<unknown>>('/supplements', formData, {
            timeout: 180000,
        }),

    // 영양제 목록 조회
    getSupplements: (page: number, size: number = 10) =>
        apiClient.get<SuccessResponse<SupplementListResponse>>('/supplements', {
            params: { page, size },
        }),

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