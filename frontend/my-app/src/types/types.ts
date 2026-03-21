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

//type/supplements
export interface IngredientInput {
  normalizedName: string;
  rawName: string;
  unit: string;
  amount: number;
}

export interface SupplementCreateRequest {
  supplementImageUrl: string;
  alias: string;
  dailyDose?: number;        // Required: No
  dosePerIntake: number;
  capacity: number;
  bodyPartId: number;
  ingredients: IngredientInput[];
}

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

