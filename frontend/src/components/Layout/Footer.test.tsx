import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi, describe, it, expect } from 'vitest'

vi.mock('@chakra-ui/react', async () => {
  const React = await import('react')
  return {
    Box: (props: any) => React.createElement('div', props, props.children),
    Text: (props: any) => React.createElement('span', props, props.children),
    Flex: (props: any) => React.createElement('footer', { role: 'contentinfo', ...props }, props.children),
  }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, fallback?: string) => fallback ?? k,
  }),
}))

import Footer from './Footer'

describe('Footer', () => {
  it('renders footer with copyright text', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByText(/Reservas/)).toBeInTheDocument()
  })
})
