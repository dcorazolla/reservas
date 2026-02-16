import api, { setAuthToken } from './api'

const TOKEN_KEY = 'auth_token'
const REFRESH_KEY = 'refresh_token'

export type LoginResponse = {
  access_token?: string
  accessToken?: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
}

export async function loginRequest(email: string, password: string) {
  const res = await api.post<LoginResponse>('/api/auth/login', { email, password })
  const data = res.data as any
  // normalize to a single accessToken field
  return {
    accessToken: data.access_token ?? data.accessToken ?? null,
    refreshToken: data.refresh_token ?? data.refreshToken ?? null,
    tokenType: data.token_type ?? data.tokenType ?? null,
    expiresIn: data.expires_in ?? data.expiresIn ?? null,
  }
}

export function decodeTokenPayload(token?: string | null) {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

export function saveRefreshToken(refreshToken: string, remember = true) {
  try {
    if (remember) {
      localStorage.setItem(REFRESH_KEY, refreshToken)
    } else {
      sessionStorage.setItem(REFRESH_KEY, refreshToken)
    }
  } catch (e) {
    // ignore
  }
}

export function saveToken(token: string, remember = true, refreshToken?: string) {
  try {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token)
      if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
    } else {
      sessionStorage.setItem(TOKEN_KEY, token)
      if (refreshToken) sessionStorage.setItem(REFRESH_KEY, refreshToken)
    }

    setAuthToken(token)
  } catch (e) {
    // ignore
  }
}

export function removeToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_KEY)
    setAuthToken(null)
  } catch (e) {
    // ignore
  }
}

export function loadToken(): string | null {
  try {
    // prefer sessionStorage (current session) over localStorage
    return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY)
  } catch (e) {
    return null
  }
}
export type LoginPayload = { email: string; password: string }

export async function login(payload: LoginPayload) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Login failed')
  }

  return res.json()
}
