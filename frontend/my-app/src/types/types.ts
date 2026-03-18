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

