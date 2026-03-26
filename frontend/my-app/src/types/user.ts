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
