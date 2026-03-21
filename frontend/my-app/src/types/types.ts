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
} from './supplement';

// Success Wrapper
export interface SuccessResponse<T> {
  message: string;
  data: T;
}

// Intake Schedule
export interface IntakeScheduleItem {
  userSupplementScheduleId: number;
  intakeTime: string; // HH:mm
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
    userSupplementScheduleId?: number | null;
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

