import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '@/shared/constants';
import {
  clearStoredAuth,
  hasValidStoredAccessToken,
  getStoredAccessToken,
} from '@/shared/utils/auth-token';
import { authApi } from '../api/auth.api';
import type { User, LoginRequest, SignupRequest } from './auth.types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(hasValidStoredAccessToken() ? getStoredUser() : null);
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
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }

  async function signup(data: SignupRequest) {
    const response = await authApi.signup(data);
    return response.data;
  }

  async function ensureUser() {
    if (!token.value || user.value) return;

    const response = await authApi.me();
    user.value = response.data;
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
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
    ensureUser,
    logout,
  };
});

function getStoredUser(): User | null {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  } catch {
    clearStoredAuth();
    return null;
  }
}
