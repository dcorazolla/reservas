import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi, describe, it, expect } from 'vitest'

const mockLogout = vi.fn()
vi.mock('@contexts/AuthContext', () => ({
  useAuth: () => ({ logout: mockLogout }),
}))

vi.mock('@chakra-ui/react', async () => {
  const React = await import('react')
  return {
    Box: (props: any) => React.createElement('div', props, props.children),
    Heading: ({ as, ...props }: any) => React.createElement(as ?? 'h2', props, props.children),
    Text: (props: any) => React.createElement('p', props, props.children),
    Button: (props: any) => React.createElement('button', props, props.children),
  }
})

import Home from './Home'

describe('Home', () => {
  it('renders welcome heading and logout button', () => {
    render(<Home />)
    expect(screen.getByText('Bem-vindo')).toBeInTheDocument()
    expect(screen.getByText('Sair')).toBeInTheDocument()
  })

  it('calls logout when Sair button clicked', () => {
    render(<Home />)
    fireEvent.click(screen.getByText('Sair'))
    expect(mockLogout).toHaveBeenCalled()
  })
})
