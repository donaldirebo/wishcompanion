import { apiClient } from './apiClient';
import type { User, LoginRequest, LoginResponse, RegisterRequest } from '../types/api';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>('/auth/login', data);
    return res.data;
  },

  async register(data: RegisterRequest): Promise<User> {
    const res = await apiClient.post<User>('/auth/register', data);
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
};
