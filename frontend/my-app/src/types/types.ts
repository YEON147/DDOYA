// type/auth
export interface SignupStep1Input {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupStep2Input {
  nickname: string;
  gender: string;
  birthDate: string;
  heightCm: number;
  weightKg: number;
}
export type SignupRequest = SignupStep1Input & SignupStep2Input;

export type {
  SupplementCreateRequest,
  OcrResult,
  OcrIngredient,
  IngredientAnalyzePayload,
  IngredientAnalyzeIngredientDto,
} from './supplement';
export { ingredientAnalyzeToOcrResult } from './supplement';

// Success Wrapper
export interface SuccessResponse<T> {
  message: string;
  data: T;
}

// Intake Schedule
export interface IntakeScheduleItem {
  scheduleId: number | null;
  intakeTime: string; // HH:mm
}

/** GET /supplements 목록 행 */
export interface SupplementSummaryDto {
  userSupplementId: number;
  pillImageUrl: string;
  primaryIngredientNames?: string[];
  alias: string;
  stockQuantity: number;
}

/** GET /supplements 페이징 본문 */
export interface SupplementListResponse {
  supplements: SupplementSummaryDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

// Detail Response
export interface SupplementDetailResponse {
  userSupplementId: number;
  pillImageUrl: string;
  alias: string;
  primaryIngredientNames: string[];
  dailyDose: number;
  dosePerIntake: number;
  stockQuantity: number;
  stockNotificationEnabled: boolean;
  intakeSchedules: IntakeScheduleItem[];
}

// Update Request
export interface SupplementUpdateRequest {
  alias: string;
  dailyDose: number;
  dosePerIntake: number;
  stockQuantity: number;
  stockNotificationEnabled: boolean;
  intakeSchedules: {
    scheduleId?: number | null;
    intakeTime: string;
  }[];
}

// Update Response
export interface SupplementUpdateResponse {
  userSupplementId: number;
  alias: string;
  dailyDose: number;
  dosePerIntake: number;
  stockQuantity: number;
  stockNotificationEnabled: boolean;
  intakeSchedules: IntakeScheduleItem[];
}

