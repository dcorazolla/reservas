const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const EXPIRES_AT_KEY = "expires_at";

export function setTokens(accessToken: string, refreshToken: string, expiresInSeconds: number) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function isAccessTokenValid(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  const exp = Number(localStorage.getItem(EXPIRES_AT_KEY) || 0);
  return exp > Date.now();
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
}
