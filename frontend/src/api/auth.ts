import { apiFetch } from "./client";
import { setTokens, clearTokens } from "../auth/token";

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
