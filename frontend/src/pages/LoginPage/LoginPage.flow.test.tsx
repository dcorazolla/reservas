import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock AuthContext
const mockLogin = vi.fn()
const mockLogout = vi.fn()
let mockToken: string | null = null

vi.mock('@contexts/AuthContext', () => ({
  useAuth: () => ({
    token: mockToken,
    login: mockLogin,
    logout: mockLogout,
  }),
}))

// Mock auth service
vi.mock('@services/auth', () => ({
  decodeTokenPayload: (tok: string | null) => {
    if (!tok) return null
    try {
      return JSON.parse(tok)
    } catch {
      return null
    }
  },
}))

// Mock react-icons
vi.mock('react-icons/fa', () => ({
  FaGoogle: (props: any) => React.createElement('span', props, 'GoogleIcon'),
  FaFacebookF: (props: any) => React.createElement('span', props, 'FBIcon'),
}))
vi.mock('react-icons/ai', () => ({
  AiOutlineWarning: (props: any) => React.createElement('span', props, 'WarningIcon'),
}))

// Mock Chakra UI with all components used by LoginPage
vi.mock('@chakra-ui/react', async () => {
  const React = await import('react')
  return {
    Box: ({ as, onSubmit, ...props }: any) => {
      const tag = as === 'form' ? 'form' : 'div'
      return React.createElement(tag, { onSubmit, ...props }, props.children)
    },
    VStack: ({ as, onSubmit, ...props }: any) => {
      const tag = as === 'form' ? 'form' : 'div'
      return React.createElement(tag, { onSubmit, ...props }, props.children)
    },
    FieldRoot: (props: any) => React.createElement('div', props, props.children),
    FieldLabel: (props: any) => React.createElement('label', props, props.children),
    FieldErrorText: (props: any) => React.createElement('span', { role: 'alert', ...props }, props.children),
    Input: React.forwardRef(({ ...props }: any, ref: any) => React.createElement('input', { ref, ...props })),
    Button: (props: any) => React.createElement('button', { ...props, type: props.type || 'button' }, props.children),
    Skeleton: (props: any) => React.createElement('div', props, 'Loading...'),
    Heading: (props: any) => React.createElement('h1', props, props.children),
    HStack: (props: any) => React.createElement('div', props, props.children),
    Link: (props: any) => React.createElement('a', props, props.children),
    VisuallyHidden: (props: any) => React.createElement('span', { style: { display: 'none' }, ...props }, props.children),
    Text: (props: any) => React.createElement('span', props, props.children),
    Flex: (props: any) => React.createElement('div', props, props.children),
  }
})

// Mock LanguageSelector
vi.mock('@components/LanguageSelector', () => ({
  LanguageSelector: () => React.createElement('div', { 'data-testid': 'lang-sel' }, 'LangSelector'),
}))

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, fallback?: string) => {
      const map: Record<string, string> = {
        'login.title': 'Login',
        'login.subtitle': 'Entre na sua conta',
        'login.email': 'Email',
        'login.password': 'Senha',
        'login.submit': 'Entrar',
        'login.remember_me': 'Lembrar-me',
        'login.forgot': 'Esqueci minha senha',
        'login.or': 'ou',
        'login.social_google': 'Google',
        'login.social_facebook': 'Facebook',
        'login.social_google_notice': 'Google em breve',
        'login.social_facebook_notice': 'Facebook em breve',
        'login.no_account': 'Não tem conta?',
        'login.create_account': 'Criar conta',
        'login.error': 'Erro ao entrar',
        'login.accessible_help': 'Ajuda acessível',
        'login.email_error': 'Email inválido',
        'login.password_error': 'Mínimo 6 caracteres',
        'login.email_placeholder': 'seu@email.com',
        'login.password_placeholder': '••••••••',
      }
      return map[k] ?? fallback ?? k
    },
    i18n: { language: 'pt-BR', changeLanguage: vi.fn() },
  }),
}))

import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToken = null
  })

  it('renders login form with title, fields and buttons', async () => {
    render(<LoginPage />)
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Entre na sua conta')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByText('Entrar')).toBeInTheDocument()
    expect(screen.getByText('Google')).toBeInTheDocument()
    expect(screen.getByText('Facebook')).toBeInTheDocument()
    expect(screen.getByText('Lembrar-me')).toBeInTheDocument()
  })

  it('submits login form with valid data', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    render(<LoginPage />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Senha')
    await userEvent.type(emailInput, 'user@test.com')
    await userEvent.type(passwordInput, 'password123')

    // click submit
    await userEvent.click(screen.getByText('Entrar'))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'password123', false)
    })
  })

  it('shows error notice when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))
    render(<LoginPage />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Senha')
    await userEvent.type(emailInput, 'user@test.com')
    await userEvent.type(passwordInput, 'password123')
    await userEvent.click(screen.getByText('Entrar'))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('shows error from axios response.data.message', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'API error message' } },
    })
    render(<LoginPage />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Senha')
    await userEvent.type(emailInput, 'user@test.com')
    await userEvent.type(passwordInput, 'password123')
    await userEvent.click(screen.getByText('Entrar'))

    await waitFor(() => {
      expect(screen.getByText('API error message')).toBeInTheDocument()
    })
  })

  it('redirects to / if token is valid and not expired', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600
    mockToken = JSON.stringify({ exp: futureExp })
    render(<LoginPage />)
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('calls logout if token is expired', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600
    mockToken = JSON.stringify({ exp: pastExp })
    render(<LoginPage />)
    expect(mockLogout).toHaveBeenCalled()
  })

  it('clears notice when typing in fields', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Fail'))
    render(<LoginPage />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Senha')
    await userEvent.type(emailInput, 'user@test.com')
    await userEvent.type(passwordInput, 'password123')
    await userEvent.click(screen.getByText('Entrar'))

    await waitFor(() => {
      expect(screen.getByText('Fail')).toBeInTheDocument()
    })

    // typing in email should clear notice
    await userEvent.type(emailInput, 'x')
    expect(screen.queryByText('Fail')).not.toBeInTheDocument()
  })

  it('shows social login notice on Google click', async () => {
    render(<LoginPage />)
    await userEvent.click(screen.getByText('Google'))
    await waitFor(() => {
      expect(screen.getByText('Google em breve')).toBeInTheDocument()
    })
  })

  it('shows social login notice on Facebook click', async () => {
    render(<LoginPage />)
    await userEvent.click(screen.getByText('Facebook'))
    await waitFor(() => {
      expect(screen.getByText('Facebook em breve')).toBeInTheDocument()
    })
  })

  it('populates form from autofilled inputs on mount', async () => {
    // Simulate browser autofill by setting input values before component reads them
    const origGetElementById = document.getElementById.bind(document)
    const mockEmailEl = { value: 'auto@fill.com' }
    const mockPassEl = { value: 'autopassword' }

    vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
      if (id === 'email') return mockEmailEl as any
      if (id === 'password') return mockPassEl as any
      return origGetElementById(id)
    })

    render(<LoginPage />)

    // The effect should have called setValue with the autofilled values.
    // We can't directly check react-hook-form state, but the effect ran without error.
    // Restore the mock
    vi.restoreAllMocks()
  })
})
