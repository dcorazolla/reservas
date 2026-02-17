import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@chakra-ui/react', async () => {
  const React = await import('react')
  return {
    ChakraProvider: ({ children }: any) => React.createElement('div', { 'data-testid': 'chakra-provider' }, children),
    defaultSystem: {},
  }
})

import AppChakraProvider from './ChakraProvider'

describe('AppChakraProvider', () => {
  it('renders children inside ChakraProvider', () => {
    render(
      <AppChakraProvider>
        <span>child</span>
      </AppChakraProvider>,
    )
    expect(screen.getByTestId('chakra-provider')).toBeInTheDocument()
    expect(screen.getByText('child')).toBeInTheDocument()
  })
})
