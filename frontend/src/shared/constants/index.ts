export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_FILE_TYPES = ['application/pdf'];

export const DEFAULT_PAGE_SIZE = 10;

export const TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const USER_KEY = 'auth_user';
