import apiClient from './client';
import { SignupRequest } from '../types/types';

export const authApi = {
  signup: (data: SignupRequest) =>
    apiClient.post('/auth/signup', data),

  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  logout: () =>
    apiClient.post('/auth/logout'),
};