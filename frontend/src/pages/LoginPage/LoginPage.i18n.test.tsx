import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
// Mock useAuth to avoid requiring AuthProvider in this test
vi.mock('@contexts/AuthContext', () => ({
  useAuth: () => ({ token: null, login: async () => {}, logout: () => {} }),
}))
import { I18nextProvider } from 'react-i18next'
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LoginPage from './LoginPage'
import AppChakraProvider from '@design/ChakraProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const resources = {
  'pt-BR': {
    common: {
      login: {
        title: 'Entrar',
      },
    },
  },
  en: {
    common: {
      login: {
        title: 'Sign in',
      },
    },
  },
}

describe('LoginPage i18n', () => {
  let i18n: i18next.i18n
  let queryClient: QueryClient

  beforeAll(async () => {
    i18n = i18next.createInstance()
    await i18n.use(initReactI18next).init({
      resources,
      lng: 'pt-BR',
      fallbackLng: 'pt-BR',
      ns: ['common'],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    })

    // expose globally so the component fallback can use window.i18next if present
    ;(global as any).window = (global as any).window || {}
    ;(global as any).window.i18next = i18n

    queryClient = new QueryClient()
  })

  afterAll(() => {
    // cleanup
    ;(global as any).window.i18next = undefined
  })

  it('renders heading in pt-BR by default and switches to en', async () => {
    const { MemoryRouter } = await import('react-router-dom')
    render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <AppChakraProvider>
            <MemoryRouter>
              <LoginPage />
            </MemoryRouter>
          </AppChakraProvider>
        </QueryClientProvider>
      </I18nextProvider>,
    )

    // initial should be pt-BR
    expect((await screen.findByRole('heading', { level: 1 })).textContent).toBe('Entrar')

    // change language using the LanguageSelector toggle (button)
    const toggle = await screen.findByRole('button', { name: /Português|Inglês|English/i })
    fireEvent.click(toggle)
    const enOption = await screen.findByText(/Inglês|English/)
    fireEvent.click(enOption)

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Sign in')
    })
  })
})
