/** Spring `POST /supplements/ingredients/ocr` 응답 본문 (FastAPI OCR 결과를 서버에서 가공한 형태) */
export type IngredientAnalyzeIngredientDto = {
  normalizedIngredientId: number;
  normalizedName: string;
  rawName: string;
  unit: string;
  amount: number;
  isPrimary: boolean;
};

export type IngredientAnalyzePayload = {
  success: boolean;
  message: string;
  bodyPartId: number | null;
  bodyPartName: string | null;
  dailyDose: number | null;
  dosePerIntake: number | null;
  ingredients: IngredientAnalyzeIngredientDto[] | null;
};

/** OCR·등록 요청 공통: 백엔드가 내려주는 성분 형태와 등록 시 ingredients 배열이 동일 */
export type OcrIngredient = {
  normalizedIngredientId: number;
  normalizedName: string;
  rawName: string;
  unit: string;
  amount: number;
  isPrimary: boolean;
};

export interface SupplementCreateRequest {
  alias: string;
  dailyDose: number;
  dosePerIntake: number;
  capacity: number;
  bodyPartId: number;
  bodyPartName: string;
  ingredients: OcrIngredient[];
}

export type OcrResult = {
  success: boolean;
  message: string;
  bodyPartId: number;
  bodyPartName: string;
  dailyDose: number;
  dosePerIntake: number;
  ingredients: OcrIngredient[];
};

/** `IngredientAnalyzePayload` → 등록 플로우 스토어용 `OcrResult` */
export function ingredientAnalyzeToOcrResult(payload: IngredientAnalyzePayload): OcrResult {
  const ingredients: OcrIngredient[] = (payload.ingredients ?? []).map((ing) => ({
    normalizedIngredientId: Number(ing.normalizedIngredientId),
    normalizedName: ing.normalizedName ?? '',
    rawName: ing.rawName ?? '',
    unit: ing.unit ?? '',
    amount: Number(ing.amount ?? 0),
    isPrimary: Boolean(ing.isPrimary),
  }));

  return {
    success: payload.success,
    message: payload.message ?? '',
    bodyPartId: payload.bodyPartId ?? 0,
    bodyPartName: payload.bodyPartName ?? '',
    dailyDose: payload.dailyDose ?? 0,
    dosePerIntake: payload.dosePerIntake ?? 0,
    ingredients,
  };
}
