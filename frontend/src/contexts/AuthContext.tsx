import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginRequest, saveToken, removeToken, loadToken, decodeTokenPayload } from '@services/auth'
import { setAuthToken, default as api } from '@services/api'

type AuthContextType = {
  token: string | null
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return loadToken()
    } catch (e) {
      return null
    }
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (token) setAuthToken(token)
  }, [token])

  // schedule auto-logout on token expiry and register axios 401 handler
  React.useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    // clear previous interceptor if any
    let interceptorId: number | null = null

    function scheduleLogoutIfNeeded(tok: string | null) {
      if (!tok) return
      const payload = decodeTokenPayload(tok) as any
      if (!payload?.exp) return
      const expiresAt = payload.exp * 1000
      const now = Date.now()
      if (expiresAt <= now) {
        // already expired
        logout()
        return
      }
      const ms = expiresAt - now + 1000 // add 1s margin
      timeoutId = setTimeout(() => {
        logout()
      }, ms)
    }

    // attach axios response interceptor to catch 401s
    try {
      interceptorId = api.interceptors.response.use(
        (r) => r,
        (err) => {
          const status = err?.response?.status
          if (status === 401) {
            logout()
          }
          return Promise.reject(err)
        }
      )
    } catch (e) {
      // ignore if interceptors not available
    }

    scheduleLogoutIfNeeded(token)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (interceptorId !== null) {
        try {
          api.interceptors.response.eject(interceptorId)
        } catch (e) {
          // ignore
        }
      }
    }
  }, [token])

  // Sync auth token across browser tabs/windows. When one tab updates
  // localStorage/sessionStorage (login/logout), other tabs receive a
  // `storage` event — reload the token from storage and update state.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      try {
        const t = loadToken()
        setToken(t)
        if (t) {
          setAuthToken(t)
          // if user is on the login page, navigate to home when token appears
          if (window.location.pathname === '/login') {
            navigate('/', { replace: true })
          }
        } else {
          setAuthToken(null)
          // if token was removed (logout in another tab), redirect to login
          if (window.location.pathname !== '/login') {
            navigate('/login', { replace: true })
          }
        }
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [navigate])

  async function login(email: string, password: string, remember = true) {
    const data = await loginRequest(email, password)
    const token = (data as any).accessToken ?? (data as any).access_token ?? null
    const refresh = (data as any).refreshToken ?? (data as any).refresh_token ?? null
    if (!token) {
      throw new Error('Missing access token in login response')
    }

    saveToken(token, remember, refresh ?? undefined)
    setToken(token)
    setAuthToken(token)
    navigate('/')
  }

  function logout() {
    removeToken()
    setToken(null)
    setAuthToken(null)
    navigate('/login')
  }

  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
