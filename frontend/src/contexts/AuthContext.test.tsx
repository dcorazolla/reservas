import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// ---- mocks ----

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

const mockLoginRequest = vi.fn()
const mockSaveToken = vi.fn()
const mockRemoveToken = vi.fn()
const mockLoadToken = vi.fn()
const mockDecodeTokenPayload = vi.fn()

vi.mock('@services/auth', () => ({
  loginRequest: (...a: any[]) => mockLoginRequest(...a),
  saveToken: (...a: any[]) => mockSaveToken(...a),
  removeToken: (...a: any[]) => mockRemoveToken(...a),
  loadToken: (...a: any[]) => mockLoadToken(...a),
  decodeTokenPayload: (...a: any[]) => mockDecodeTokenPayload(...a),
}))

const mockSetAuthToken = vi.fn()
const mockInterceptorsUse = vi.fn(() => 42)
const mockInterceptorsEject = vi.fn()

vi.mock('@services/api', () => ({
  default: {
    interceptors: {
      response: {
        use: (...a: any[]) => mockInterceptorsUse(...a),
        eject: (...a: any[]) => mockInterceptorsEject(...a),
      },
    },
  },
  setAuthToken: (...a: any[]) => mockSetAuthToken(...a),
}))

import { AuthProvider, useAuth } from './AuthContext'

function TestConsumer() {
  const { token, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="token">{token ?? 'null'}</span>
      <button onClick={() => login('a@b.c', 'pass123')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoadToken.mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('provides null token initially when no stored token', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('token').textContent).toBe('null')
  })

  it('loads stored token on mount', () => {
    mockLoadToken.mockReturnValue('stored-token')
    mockDecodeTokenPayload.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('token').textContent).toBe('stored-token')
    expect(mockSetAuthToken).toHaveBeenCalledWith('stored-token')
  })

  it('handles loadToken throwing', () => {
    mockLoadToken.mockImplementation(() => { throw new Error('fail') })
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )
    expect(screen.getByTestId('token').textContent).toBe('null')
  })

  it('login stores token and navigates', async () => {
    mockLoginRequest.mockResolvedValue({ access_token: 'tok123', refresh_token: 'rt' })
    mockDecodeTokenPayload.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByText('login').click()
    })

    expect(mockLoginRequest).toHaveBeenCalledWith('a@b.c', 'pass123')
    expect(mockSaveToken).toHaveBeenCalledWith('tok123', true, 'rt')
    expect(mockSetAuthToken).toHaveBeenCalledWith('tok123')
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('login throws when no access_token in response', async () => {
    mockLoginRequest.mockResolvedValue({})

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    // The login function throws internally. We capture it by wrapping in a try/catch
    // in a custom consumer
    let error: Error | null = null
    const ThrowConsumer = () => {
      const { login } = useAuth()
      return (
        <button onClick={async () => {
          try { await login('a@b.c', 'pass123') } catch (e: any) { error = e }
        }}>try-login</button>
      )
    }

    const { unmount } = render(
      <AuthProvider>
        <ThrowConsumer />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getAllByText('try-login')[0].click()
    })

    expect(error).toBeInstanceOf(Error)
    expect(error!.message).toBe('Missing access token in login response')
    unmount()
  })

  it('login uses accessToken field', async () => {
    mockLoginRequest.mockResolvedValueOnce({ accessToken: 'atok', refreshToken: 'rtok' })
    mockDecodeTokenPayload.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByText('login').click()
    })

    expect(mockSaveToken).toHaveBeenCalledWith('atok', true, 'rtok')
  })

  it('logout removes token and navigates to /login', async () => {
    mockLoadToken.mockReturnValue('tok')
    mockDecodeTokenPayload.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByText('logout').click()
    })

    expect(mockRemoveToken).toHaveBeenCalled()
    expect(mockSetAuthToken).toHaveBeenCalledWith(null)
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('auto-logout when token already expired', () => {
    mockLoadToken.mockReturnValue('expired-tok')
    mockDecodeTokenPayload.mockReturnValue({ exp: Math.floor(Date.now() / 1000) - 10 })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    expect(mockRemoveToken).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('schedules auto-logout on token expiry', () => {
    vi.useFakeTimers()
    mockLoadToken.mockReturnValue('future-tok')
    mockDecodeTokenPayload.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 5 })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    // advance past expiry + 1s margin
    act(() => {
      vi.advanceTimersByTime(7000)
    })

    expect(mockRemoveToken).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('does not schedule logout if payload has no exp', () => {
    mockLoadToken.mockReturnValue('no-exp-tok')
    mockDecodeTokenPayload.mockReturnValue({ sub: 'user' })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    expect(mockRemoveToken).not.toHaveBeenCalled()
  })

  it('401 interceptor triggers logout', async () => {
    mockLoadToken.mockReturnValue('tok')
    mockDecodeTokenPayload.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    // get the error handler from interceptors.response.use
    const errorHandler = mockInterceptorsUse.mock.calls[0][1]
    expect(typeof errorHandler).toBe('function')

    await act(async () => {
      try {
        await errorHandler({ response: { status: 401 } })
      } catch (_) {
        // expected rejection
      }
    })

    expect(mockRemoveToken).toHaveBeenCalled()
  })

  it('401 interceptor does not logout for non-401 errors', async () => {
    mockLoadToken.mockReturnValue('tok')
    mockDecodeTokenPayload.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    const errorHandler = mockInterceptorsUse.mock.calls[0][1]

    await act(async () => {
      try {
        await errorHandler({ response: { status: 500 } })
      } catch (_) {}
    })

    expect(mockRemoveToken).not.toHaveBeenCalled()
  })

  it('storage event syncs token from other tabs (login on another tab)', async () => {
    mockLoadToken.mockReturnValue(null)

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    // simulate storage event with new token
    mockLoadToken.mockReturnValue('new-tab-token')
    Object.defineProperty(window, 'location', { value: { pathname: '/login' }, writable: true })

    await act(async () => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'token' }))
    })

    await waitFor(() => {
      expect(mockSetAuthToken).toHaveBeenCalledWith('new-tab-token')
    })
  })

  it('storage event syncs token removal (logout on another tab)', async () => {
    mockLoadToken.mockReturnValue('tok')
    mockDecodeTokenPayload.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    // simulate logout in another tab
    mockLoadToken.mockReturnValue(null)
    Object.defineProperty(window, 'location', { value: { pathname: '/settings' }, writable: true })

    await act(async () => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'token' }))
    })

    await waitFor(() => {
      expect(mockSetAuthToken).toHaveBeenCalledWith(null)
    })
  })

  it('ejects interceptor on cleanup', () => {
    mockLoadToken.mockReturnValue(null)

    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    )

    unmount()
    expect(mockInterceptorsEject).toHaveBeenCalledWith(42)
  })
})

describe('useAuth outside provider', () => {
  it('throws when used outside AuthProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within AuthProvider')
    spy.mockRestore()
  })
})
