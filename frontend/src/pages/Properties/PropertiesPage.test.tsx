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
    HStack: (props: any) => React.createElement('div', props, props.children),
    VStack: (props: any) => React.createElement('div', props, props.children),
    CloseButton: (props: any) => React.createElement('button', props, '×'),
  }
})

// Mock Message component
vi.mock('@components/Shared/Message/Message', async () => {
  const React = await import('react')
  return {
    default: (props: any) => React.createElement('div', { 'data-testid': `message-${props.type}`, role: 'alert' }, props.message),
  }
})

// mock backend service to return the sample items synchronously
vi.mock('@services/properties', async () => {
  return {
    listProperties: () => Promise.resolve([
      { id: 'p-1', name: 'Pousada Sol', timezone: 'Europe/Lisbon' },
      { id: 'p-2', name: 'Hotel Mar', timezone: 'Europe/Paris' },
    ]),
    createProperty: () => Promise.resolve({ id: 'p-new', name: 'Nova', timezone: 'UTC' }),
    updateProperty: (id: string) => Promise.resolve({ id, name: 'Updated', timezone: 'UTC' }),
    deleteProperty: () => Promise.resolve(),
  }
})

// mock react-i18next to return simple translations for the test
vi.mock('react-i18next', () => {
  return {
    useTranslation: () => ({
      t: (k: string) => {
        const map: Record<string, string> = {
          'properties.page.title': 'Propriedades',
          'properties.form.new': 'Nova propriedade',
          'properties.actions.edit': 'Editar',
          'properties.actions.delete': 'Remover',
        }
        return map[k] ?? k
      },
    }),
  }
})

import PropertiesPage from './PropertiesPage'

describe('PropertiesPage', () => {
  it('renders list of properties and controls', async () => {
    render(<PropertiesPage />)

    expect(screen.getByText('Propriedades')).toBeInTheDocument()
    // sample items (loaded async)
    expect(await screen.findByText('Pousada Sol')).toBeInTheDocument()
    expect(await screen.findByText('Hotel Mar')).toBeInTheDocument()
    expect(screen.getByText('Nova propriedade')).toBeInTheDocument()
  })
})
