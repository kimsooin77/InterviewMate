import axios from 'axios';
import type { AxiosError } from 'axios';
import { API_BASE_URL } from '@/shared/constants';
import {
  clearStoredAuth,
  getStoredAccessToken,
  isAccessTokenExpired,
  markSessionExpired,
} from '@/shared/utils/auth-token';
import type { ApiError } from './types';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request: Access Token 자동 주입
apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();

  if (token) {
    if (isAccessTokenExpired(token)) {
      clearStoredAuth();
      redirectToLogin(true);
      return config;
    }

    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: 에러 핸들링
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      clearStoredAuth();
      redirectToLogin(!isAuthRequest(error));
    }
    return Promise.reject(error);
  },
);

function redirectToLogin(sessionExpired = false) {
  const currentPath = window.location.pathname + window.location.search;
  if (window.location.pathname === '/login') return;

  if (sessionExpired) {
    markSessionExpired();
  }

  const redirect = encodeURIComponent(currentPath);
  window.location.replace(`/login?redirect=${redirect}`);
}

function isAuthRequest(error: AxiosError<ApiError>) {
  const requestUrl = error.config?.url || '';
  return requestUrl.includes('/auth/login') || requestUrl.includes('/auth/signup');
}

export default apiClient;
