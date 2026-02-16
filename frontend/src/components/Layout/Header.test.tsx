import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from './Header'
import AppChakraProvider from '@design/ChakraProvider'
import { vi } from 'vitest'

const mockLogout = vi.fn()

vi.mock('@contexts/AuthContext', () => {
  return {
    useAuth: () => ({ token: 'fake.jwt.token', logout: mockLogout }),
  }
})

vi.mock('@utils/jwt', () => ({
  decodeJwtPayload: () => ({ property_name: 'My Property', name: 'John Doe', email: 'john@example.com' }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, def?: string) => def ?? k }),
}))

describe('Header', () => {
  beforeEach(() => {
    mockLogout.mockClear()
  })

  test('renders property, subtitle and opens user menu + logout', () => {
    render(
      <AppChakraProvider>
        <Header onOpenMenu={() => {}} />
      </AppChakraProvider>
    )

    // property and subtitle
    expect(screen.getByText('My Property')).toBeInTheDocument()
    expect(screen.getByText('gestão de reservas')).toBeInTheDocument()

    // click the avatar initials to open menu
    const initials = screen.getByText('JD')
    const button = initials.closest('button')
    expect(button).toBeTruthy()
    if (button) fireEvent.click(button)

    // menu shows user info and logout
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    const logoutBtn = screen.getByText('Sair')
    fireEvent.click(logoutBtn)
    expect(mockLogout).toHaveBeenCalled()
  })
})
