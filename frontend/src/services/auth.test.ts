import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock the api module
vi.mock('./api', () => {
  const post = vi.fn()
  return {
    default: { post },
    setAuthToken: vi.fn(),
    __mocks: { post },
  }
})

// Mock global fetch for the login() function
const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

import {
  loginRequest,
  decodeTokenPayload,
  saveRefreshToken,
  saveToken,
  removeToken,
  loadToken,
  login,
} from './auth'

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('loginRequest', () => {
    it('normalises access_token response', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.post.mockResolvedValueOnce({
        data: { access_token: 'tok', refresh_token: 'ref', token_type: 'Bearer', expires_in: 3600 },
      })
      const res = await loginRequest('a@b.com', '123456')
      expect(res.accessToken).toBe('tok')
      expect(res.refreshToken).toBe('ref')
      expect(res.tokenType).toBe('Bearer')
      expect(res.expiresIn).toBe(3600)
      expect((api as any).__mocks.post).toHaveBeenCalledWith('/api/auth/login', { email: 'a@b.com', password: '123456' })
    })

    it('normalises accessToken response', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.post.mockResolvedValueOnce({
        data: { accessToken: 'tok2', refreshToken: 'ref2', tokenType: 'Bearer', expiresIn: 7200 },
      })
      const res = await loginRequest('x@y.com', 'abc')
      expect(res.accessToken).toBe('tok2')
      expect(res.refreshToken).toBe('ref2')
    })

    it('returns null fields when response is empty', async () => {
      const api = await import('./api')
      ;(api as any).__mocks.post.mockResolvedValueOnce({ data: {} })
      const res = await loginRequest('e@f.com', 'pwd')
      expect(res.accessToken).toBeNull()
      expect(res.refreshToken).toBeNull()
      expect(res.tokenType).toBeNull()
      expect(res.expiresIn).toBeNull()
    })
  })

  describe('decodeTokenPayload', () => {
    function makeJwt(payload: Record<string, any>) {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      const body = btoa(JSON.stringify(payload))
      return `${header}.${body}.signature`
    }

    it('returns null for falsy token', () => {
      expect(decodeTokenPayload(null)).toBeNull()
      expect(decodeTokenPayload(undefined)).toBeNull()
      expect(decodeTokenPayload('')).toBeNull()
    })

    it('returns null for token with < 2 parts', () => {
      expect(decodeTokenPayload('onlyonepart')).toBeNull()
    })

    it('decodes valid JWT payload', () => {
      const token = makeJwt({ sub: '123', name: 'Test' })
      const decoded = decodeTokenPayload(token)
      expect(decoded).toEqual({ sub: '123', name: 'Test' })
    })

    it('returns null for invalid base64 payload', () => {
      const result = decodeTokenPayload('header.!!!invalid!!!.sig')
      expect(result).toBeNull()
    })
  })

  describe('saveRefreshToken', () => {
    it('saves to localStorage when remember=true', () => {
      saveRefreshToken('ref-tok', true)
      expect(localStorage.getItem('refresh_token')).toBe('ref-tok')
    })

    it('saves to sessionStorage when remember=false', () => {
      saveRefreshToken('ref-tok', false)
      expect(sessionStorage.getItem('refresh_token')).toBe('ref-tok')
    })
  })

  describe('saveToken', () => {
    it('saves token to localStorage with remember=true', async () => {
      const api = await import('./api')
      saveToken('my-token', true, 'my-refresh')
      expect(localStorage.getItem('auth_token')).toBe('my-token')
      expect(localStorage.getItem('refresh_token')).toBe('my-refresh')
      expect(api.setAuthToken).toHaveBeenCalledWith('my-token')
    })

    it('saves token to sessionStorage with remember=false', async () => {
      const api = await import('./api')
      saveToken('my-token', false, 'my-refresh')
      expect(sessionStorage.getItem('auth_token')).toBe('my-token')
      expect(sessionStorage.getItem('refresh_token')).toBe('my-refresh')
      expect(api.setAuthToken).toHaveBeenCalledWith('my-token')
    })

    it('saves without refresh token', async () => {
      saveToken('my-token', true)
      expect(localStorage.getItem('auth_token')).toBe('my-token')
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })
  })

  describe('removeToken', () => {
    it('clears all storage and auth header', async () => {
      const api = await import('./api')
      localStorage.setItem('auth_token', 't')
      localStorage.setItem('refresh_token', 'r')
      sessionStorage.setItem('auth_token', 't2')
      sessionStorage.setItem('refresh_token', 'r2')

      removeToken()

      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
      expect(sessionStorage.getItem('auth_token')).toBeNull()
      expect(sessionStorage.getItem('refresh_token')).toBeNull()
      expect(api.setAuthToken).toHaveBeenCalledWith(null)
    })
  })

  describe('loadToken', () => {
    it('returns sessionStorage token first', () => {
      sessionStorage.setItem('auth_token', 'session-tok')
      localStorage.setItem('auth_token', 'local-tok')
      expect(loadToken()).toBe('session-tok')
    })

    it('falls back to localStorage', () => {
      localStorage.setItem('auth_token', 'local-tok')
      expect(loadToken()).toBe('local-tok')
    })

    it('returns null when no token stored', () => {
      expect(loadToken()).toBeNull()
    })

    it('returns null when storage throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('SecurityError') })
      expect(loadToken()).toBeNull()
      vi.restoreAllMocks()
    })
  })

  describe('login (fetch-based)', () => {
    it('calls fetch and returns json on success', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'abc' }),
      })
      const res = await login({ email: 'a@b.com', password: '123456' })
      expect(res).toEqual({ token: 'abc' })
      expect(fetchMock).toHaveBeenCalledWith('/api/login', expect.objectContaining({ method: 'POST' }))
    })

    it('throws on non-ok response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Bad credentials',
      })
      await expect(login({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow('Bad credentials')
    })

    it('throws default message when response body is empty', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        text: async () => '',
      })
      await expect(login({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow('Login failed')
    })
  })
})
