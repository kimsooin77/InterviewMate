import apiClient from '@/shared/api/client';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from '../model/auth.types';

export const authApi = {
  signup(data: SignupRequest) {
    return apiClient.post<SignupResponse>('/auth/signup', data);
  },

  login(data: LoginRequest) {
    return apiClient.post<LoginResponse>('/auth/login', data);
  },
};
