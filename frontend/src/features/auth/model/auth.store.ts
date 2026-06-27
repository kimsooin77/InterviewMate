import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/shared/constants';
import {
  clearStoredAuth,
  hasValidStoredAccessToken,
  getStoredAccessToken,
} from '@/shared/utils/auth-token';
import { authApi } from '../api/auth.api';
import type { User, LoginRequest, SignupRequest } from './auth.types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(
    hasValidStoredAccessToken() ? getStoredAccessToken() : null,
  );

  const isAuthenticated = computed(() => !!token.value);

  async function login(data: LoginRequest) {
    const response = await authApi.login(data);
    const { accessToken, refreshToken, user: userData } = response.data;

    token.value = accessToken;
    user.value = userData;

    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  async function signup(data: SignupRequest) {
    const response = await authApi.signup(data);
    return response.data;
  }

  function logout() {
    token.value = null;
    user.value = null;
    clearStoredAuth();
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    signup,
    logout,
  };
});
