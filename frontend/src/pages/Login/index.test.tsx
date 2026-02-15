import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'

// Mock Chakra UI to avoid rendering provider complexities in unit tests.
vi.mock('@chakra-ui/react', () => {
  const React = require('react')
  const Input = React.forwardRef((props: any, ref: any) => React.createElement('input', { ...props, ref }))
  return {
    VStack: (props: any) => React.createElement(props.as || 'div', props, props.children),
    FormControl: (props: any) => React.createElement('div', props, props.children),
    FormLabel: (props: any) => React.createElement('label', props, props.children),
    Input,
    Button: (props: any) => React.createElement('button', props, props.children),
    FormErrorMessage: (props: any) => React.createElement('div', props, props.children),
    Text: (props: any) => React.createElement('div', props, props.children),
    Skeleton: (props: any) => React.createElement('div', props, props.children),
    // provide ChakraProvider as passthrough
    ChakraProvider: (props: any) => React.createElement('div', props, props.children),
  }
})
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppChakraProvider from '../../design-system/ChakraProvider'

vi.mock('../../services/auth', () => ({
  login: vi.fn(),
}))

import LoginPage from './index'
import { login } from '../../services/auth'

describe('LoginPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows error on failed login', async () => {
    ;(login as unknown as vi.Mock).mockRejectedValue(new Error('Credenciais inválidas'))

    render(
      <AppChakraProvider>
        <LoginPage />
      </AppChakraProvider>
    )

    await userEvent.type(screen.getByLabelText(/email/i), 'foo@example.com')
    await userEvent.type(screen.getByLabelText(/senha/i), '123456')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalled()
    })

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('Credenciais inválidas')
  })
})
