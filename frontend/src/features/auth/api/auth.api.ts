import apiClient from '@/shared/api/client';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  User,
} from '../model/auth.types';

export const authApi = {
  signup(data: SignupRequest) {
    return apiClient.post<SignupResponse>('/auth/signup', data);
  },

  login(data: LoginRequest) {
    return apiClient.post<LoginResponse>('/auth/login', data);
  },

  me() {
    return apiClient.get<User>('/auth/me');
  },
};
