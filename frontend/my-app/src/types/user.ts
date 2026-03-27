import { SuccessResponse } from './types';

export interface UserMe {
  userId: number;
  email: string;
  nickname: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  heightCm: number;
  weightKg: number;
  createdAt: string;
}

export type UserMeResponse = SuccessResponse<UserMe>;

export interface UpdateNicknameRequest {
  nickname: string;
}

export interface UpdateBirthRequest {
  birthDate: string;
}

export interface UpdateHeightRequest {
  heightCm: number;
}

export interface UpdateWeightRequest {
  weightKg: number;
}