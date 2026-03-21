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

