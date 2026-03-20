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
