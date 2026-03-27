import apiClient from './client';
import {
  UserMeResponse,
  UpdateNicknameRequest,
  UpdateBirthRequest,
  UpdateHeightRequest,
  UpdateWeightRequest,
} from '../types/user';

export const userApi = {
  getMe: () => apiClient.get<UserMeResponse>('/users/me'),
  updateNickname: (payload: UpdateNicknameRequest) => apiClient.put<void>('/users/me/nickname', payload),
  updateBirthDate: (payload: UpdateBirthRequest) => apiClient.put<void>('/users/me/birth', payload),
  updateHeight: (payload: UpdateHeightRequest) => apiClient.put<void>('/users/me/height', payload),
  updateWeight: (payload: UpdateWeightRequest) => apiClient.put<void>('/users/me/weight', payload),
};
