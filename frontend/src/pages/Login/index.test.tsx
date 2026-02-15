import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './index'

vi.mock('../../services/auth', () => ({
  login: vi.fn(),
}))

import { login } from '../../services/auth'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows error on failed login', async () => {
    ;(login as unknown as vi.Mock).mockRejectedValue(new Error('Credenciais inválidas'))

    render(<LoginPage />)

    await userEvent.type(screen.getByLabelText(/email/i), 'foo@example.com')
    await userEvent.type(screen.getByLabelText(/senha/i), '123456')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Credenciais inválidas')
    })
  })
})
