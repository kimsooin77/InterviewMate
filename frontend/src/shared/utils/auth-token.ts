import { REFRESH_TOKEN_KEY, TOKEN_KEY, USER_KEY } from '@/shared/constants';

type JwtPayload = {
  exp?: number;
};

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAccessTokenExpired(token: string | null): boolean {
  if (!token) return true;

  const payload = parseJwtPayload(token);
  if (!payload?.exp) return false;

  const expiresAtMs = payload.exp * 1000;
  return expiresAtMs <= Date.now();
}

export function hasValidStoredAccessToken(): boolean {
  const token = getStoredAccessToken();

  if (!token) return false;
  if (!isAccessTokenExpired(token)) return true;

  clearStoredAuth();
  return false;
}

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );

    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}
