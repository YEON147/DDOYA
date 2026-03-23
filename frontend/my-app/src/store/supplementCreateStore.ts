import { create } from 'zustand';
import type { OcrResult, SupplementCreateRequest } from '@/src/types/supplement';

/**
 * 영양제 등록 플로우 전용 (OCR → 알약 촬영 → 별칭·총량 입력 후 저장).
 * 목록/상세용 useSupplementStore 와 분리.
 */
type SupplementCreateStore = {
  ocrResult: OcrResult | null;
  /** STEP1 성분표 촬영 직후 미리보기·OCR 전까지 로컬 URI */
  ingredientLabelUri: string | null;
  /** 촬영 에셋의 MIME (multipart type 필드, 없으면 uri 확장자로 추정) */
  ingredientLabelMimeType: string | null;
  pillImageUri: string | null;
  /** 사용자 입력: 영양제 별칭 */
  alias: string;
  /** 사용자 입력: 총량(용기 기준 수량 등), 제출 시 숫자로 파싱 */
  capacityInput: string;

  setOcrResult: (result: OcrResult | null) => void;
  setIngredientLabelUri: (uri: string | null, mimeType?: string | null) => void;
  setPillImageUri: (uri: string) => void;
  setAlias: (alias: string) => void;
  setCapacityInput: (text: string) => void;
  /** OCR + 별칭 + 총량이 모두 유효할 때만 API 요청 객체 */
  buildCreateRequest: () => SupplementCreateRequest | null;
  reset: () => void;
};

const initial = {
  ocrResult: null as OcrResult | null,
  ingredientLabelUri: null as string | null,
  ingredientLabelMimeType: null as string | null,
  pillImageUri: null as string | null,
  alias: '',
  capacityInput: '',
};

export const useSupplementCreateStore = create<SupplementCreateStore>((set, get) => ({
  ...initial,

  setOcrResult: (result) => set({ ocrResult: result }),
  setIngredientLabelUri: (uri, mimeType = null) =>
    set({
      ingredientLabelUri: uri,
      ingredientLabelMimeType: uri ? mimeType ?? null : null,
    }),
  setPillImageUri: (uri) => set({ pillImageUri: uri }),
  setAlias: (alias) => set({ alias }),
  setCapacityInput: (text) => set({ capacityInput: text }),

  buildCreateRequest: () => {
    const { ocrResult, alias, capacityInput } = get();
    if (!ocrResult) return null;

    const capacity = parseFloat(capacityInput.replace(/,/g, '').trim());
    const name = alias.trim();
    if (!name || !Number.isFinite(capacity) || capacity <= 0) return null;

    return {
      alias: name,
      dailyDose: ocrResult.dailyDose,
      dosePerIntake: ocrResult.dosePerIntake,
      capacity,
      bodyPartId: ocrResult.bodyPartId,
      bodyPartName: ocrResult.bodyPartName,
      ingredients: ocrResult.ingredients,
    };
  },

  reset: () => set(initial),
}));
