const API_URL = import.meta.env.VITE_API_URL;

type FetchOptions = RequestInit & {
  json?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { json = true, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      ...(json ? { "Content-Type": "application/json" } : {}),
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
