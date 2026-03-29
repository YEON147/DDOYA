import apiClient from './client';
import { useAuthStore } from '../store/authStore';
import { Platform } from 'react-native';
import {
    SupplementCreateRequest,
    SupplementUpdateRequest,
    SuccessResponse,
    SupplementDetailResponse,
    SupplementListResponse,
    SupplementUpdateResponse,
    IngredientAnalyzePayload,
} from '../types/types';

export type PillValidationPayload = {
    success: boolean;
    message: string;
};

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

    let formattedUri = pillUri;
    if (Platform.OS === 'android' && !pillUri.startsWith('file://')) {
        formattedUri = `file://${pillUri}`;
    }

    formData.append('pillImg', { uri: formattedUri, name, type } as unknown as Blob);
    formData.append('register', JSON.stringify(register));
    return formData;
}

/** `POST /api/supplements/pill/validate` — `pillImg` */
export function buildPillValidateFormData(
    pillUri: string,
    pillMimeType: string | null | undefined
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

    let formattedUri = pillUri;
    if (Platform.OS === 'android' && !pillUri.startsWith('file://')) {
        formattedUri = `file://${pillUri}`;
    }

    formData.append('pillImg', { uri: formattedUri, name, type } as unknown as Blob);
    return formData;
}

export const supplementApi = {
    /** 성분표 이미지 OCR (서버가 FastAPI `/api/ai/ocr/analyze` 호출) — `ingredientsImg` 필드로 multipart 전송 */
    analyzeIngredientsOcr: async (formData: FormData): Promise<{ data: SuccessResponse<IngredientAnalyzePayload> }> => {
        // Axios FormData 버그(Android Network Error) 우회 목적 네이티브 fetch 사용
        const token = useAuthStore.getState().accessToken;
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/supplements/ingredients/ocr`, {
            method: 'POST',
            body: formData,
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!res.ok) {
            const error: any = new Error('Upload Failed');
            error.isAxiosError = true;
            error.response = { status: res.status, data: await res.text() };
            throw error;
        }

        const data = await res.json();
        return { data };
    },

    /** 영양제 등록 — multipart (`pillImg`, `register` JSON 문자열). 서버는 `MULTIPART_FORM_DATA`만 허용 */
    createSupplementMultipart: (formData: FormData) =>
        apiClient.post<SuccessResponse<unknown>>('/supplements', formData, {
            timeout: 180000,
        }),

    /** 알약 등록 가능 여부 검사 — multipart(`pillImg`) */
    validatePillForRegister: (formData: FormData) =>
        apiClient.post<SuccessResponse<PillValidationPayload>>('/supplements/pill/validate', formData, {
            timeout: 120000,
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