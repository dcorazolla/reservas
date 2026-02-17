import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

vi.mock('@chakra-ui/react', async () => {
  const React = await import('react')
  return {
    Box: (props: any) => React.createElement('div', props, props.children),
    Heading: (props: any) => React.createElement('h2', props, props.children),
    Text: (props: any) => React.createElement('span', props, props.children),
    Button: (props: any) => React.createElement('button', props, props.children),
  }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@services/partners', () => {
  const listMock = vi.fn()
  const createMock = vi.fn()
  const updateMock = vi.fn()
  const deleteMock = vi.fn()

  listMock.mockResolvedValue([
    { id: '1', name: 'Partner One', email: 'partner1@example.com', phone: '1234567890' },
    { id: '2', name: 'Partner Two', email: 'partner2@example.com', phone: '9876543210' },
  ])

  return {
    listPartners: () => listMock(),
    createPartner: (...args: any[]) => createMock(...args),
    updatePartner: (...args: any[]) => updateMock(...args),
    deletePartner: (...args: any[]) => deleteMock(...args),
    __mocks: { listMock, createMock, updateMock, deleteMock },
  }
})

import PartnersPage from './PartnersPage'

describe('PartnersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and displays partners list', async () => {
    render(
      <BrowserRouter>
        <PartnersPage />
      </BrowserRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('Partner One')).toBeInTheDocument()
    })
  })

  it('opens modal to create new partner', async () => {
    render(
      <BrowserRouter>
        <PartnersPage />
      </BrowserRouter>
    )
    const createButton = screen.getByRole('button', { name: 'partners.form.new' })
    fireEvent.click(createButton)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
})


