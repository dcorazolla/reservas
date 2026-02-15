import { apiFetch } from "./client";
import { setTokens, clearTokens, getRefreshToken } from "@auth/token";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number; // seconds
};

export async function login(req: LoginRequest): Promise<void> {
  const res = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(req),
  });
  setTokens(res.access_token, res.refresh_token, res.expires_in);
}

export async function me<TUser = any>(): Promise<TUser> {
  return apiFetch<TUser>("/auth/me", { method: "GET" });
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/auth/logout", { method: "POST" });
  clearTokens();
}

export async function refresh(): Promise<void> {
  const currentRt = getRefreshToken();
  if (!currentRt) throw new Error("Sem refresh token");
  const res = await apiFetch<LoginResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: currentRt }),
  });
  const nextRt = (res as any).refresh_token ?? currentRt;
  setTokens(res.access_token, nextRt, res.expires_in);
}
