const API_URL = import.meta.env.VITE_API_URL;
import { getAccessToken, isAccessTokenValid } from "../auth/token";

type FetchOptions = RequestInit & {
  json?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { json = true, headers, ...rest } = options;

  const token = isAccessTokenValid() ? getAccessToken() : null;

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      ...(json ? { "Content-Type": "application/json" } : {}),
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...rest,
  });

  if (!res.ok) {
    let error;
    try {
      error = await res.json();
    } catch {
      error = { message: "Erro inesperado" };
    }
    throw error;
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}
