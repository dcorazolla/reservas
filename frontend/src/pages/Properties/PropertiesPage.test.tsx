import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Chakra UI to avoid provider
vi.mock('@chakra-ui/react', async () => {
  const React = await import('react')
  return {
    Box: (props: any) => React.createElement('div', props, props.children),
    Heading: (props: any) => React.createElement('h2', props, props.children),
    List: (props: any) => React.createElement('ul', props, props.children),
    ListItem: (props: any) => React.createElement('li', props, props.children),
    Text: (props: any) => React.createElement('span', props, props.children),
    Button: (props: any) => React.createElement('button', props, props.children),
  }
})

import PropertiesPage from './PropertiesPage'

describe('PropertiesPage', () => {
  it('renders list of properties and controls', () => {
    render(<PropertiesPage />)

    expect(screen.getByText('Propriedades')).toBeInTheDocument()
    // sample items
    expect(screen.getByText('Pousada Sol')).toBeInTheDocument()
    expect(screen.getByText('Hotel Mar')).toBeInTheDocument()
    expect(screen.getByText('Nova propriedade')).toBeInTheDocument()
  })
})
