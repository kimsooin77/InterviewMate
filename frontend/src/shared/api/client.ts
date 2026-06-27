import axios from 'axios';
import type { AxiosError } from 'axios';
import { API_BASE_URL } from '@/shared/constants';
import {
  clearStoredAuth,
  getStoredAccessToken,
  isAccessTokenExpired,
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
      redirectToLogin();
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
      redirectToLogin();
    }
    return Promise.reject(error);
  },
);

function redirectToLogin() {
  const currentPath = window.location.pathname + window.location.search;
  if (window.location.pathname === '/login') return;

  const redirect = encodeURIComponent(currentPath);
  window.location.replace(`/login?redirect=${redirect}`);
}

export default apiClient;
