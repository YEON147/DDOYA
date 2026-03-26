import apiClient from './client';
import { UserMeResponse } from '../types/user';

export const userApi = {
  getMe: () => apiClient.get<UserMeResponse>('/users/me'),
};
