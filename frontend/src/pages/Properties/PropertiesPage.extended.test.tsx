import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

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
    t: (k: string) => {
      const map: Record<string, string> = {
        'properties.page.title': 'Propriedades',
        'properties.form.new': 'Nova propriedade',
        'properties.form.edit': 'Editar propriedade',
        'properties.form.name': 'Nome',
        'properties.form.timezone': 'Timezone',
        'properties.form.base_rates_title': 'Tarifa Base',
        'common.actions.save': 'Salvar',
        'common.actions.cancel': 'Cancelar',
        'common.actions.edit': 'Editar',
        'common.actions.delete': 'Remover',
        'common.status.error_required': 'Campo obrigatório',
        'common.status.loading': 'Carregando...',
        'common.pricing.show_rates': 'Mostrar tarifas',
        'common.pricing.hide_rates': 'Ocultar tarifas',
        'common.pricing.child_factor': 'Fator criança',
        'common.pricing.child_price': 'Preço criança',
        'common.pricing.one_adult': 'Base 1 adulto',
        'common.pricing.two_adults': 'Base 2 adultos',
        'common.pricing.additional_adult': 'Adicional adulto',
        'common.pricing.infant_max_age': 'Idade máxima (infantes)',
        'common.pricing.child_max_age': 'Idade máxima (crianças)',
        'common.confirm.delete_title': 'Confirmação',
        'common.confirm.delete_confirm': 'Remover',
        'common.confirm.delete_message_prefix': 'Deseja remover',
        'common.confirm.delete_message_suffix': '?',
      }
      return map[k] ?? k
    },
  }),
}))

vi.mock('@services/properties', () => {
  const listMock = vi.fn()
  const createMock = vi.fn()
  const updateMock = vi.fn()
  const deleteMock = vi.fn()
  listMock.mockResolvedValue([{ id: 'p-1', name: 'Pousada Sol', timezone: 'UTC' }])
  return {
    listProperties: () => listMock(),
    createProperty: (...args: any[]) => createMock(...args),
    updateProperty: (...args: any[]) => updateMock(...args),
    deleteProperty: (...args: any[]) => deleteMock(...args),
    __mocks: { listMock, createMock, updateMock, deleteMock },
  }
})

import PropertiesPage from './PropertiesPage'

describe('PropertiesPage extended flows', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows error when list fails', async () => {
    const svc = await import('@services/properties')
    svc.__mocks.listMock.mockRejectedValueOnce(new Error('Load error'))

    render(<PropertiesPage />)
    expect(await screen.findByText('Load error')).toBeInTheDocument()
  })

  it('shows loading skeletons then content', async () => {
    const svc = await import('@services/properties')
    svc.__mocks.listMock.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve([{ id: 'p-1', name: 'Pousada Sol', timezone: 'UTC' }]), 50))
    )

    render(<PropertiesPage />)
    expect(screen.queryByText('Pousada Sol')).not.toBeInTheDocument()
    expect(await screen.findByText('Pousada Sol')).toBeInTheDocument()
  })

  it('shows error when save (create) fails', async () => {
    const svc = await import('@services/properties')
    svc.__mocks.createMock.mockRejectedValueOnce(new Error('Create failed'))

    render(<PropertiesPage />)
    expect(await screen.findByText('Pousada Sol')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Nova propriedade'))

    const textInput = (await screen.findAllByRole('textbox'))[0]
    await userEvent.type(textInput, 'Nova')

    const numberInputs = screen.getAllByRole('spinbutton')
    for (const ni of numberInputs) {
      await userEvent.clear(ni)
      await userEvent.type(ni, '1')
    }

    // Open rates section and fill CurrencyInput fields
    await userEvent.click(screen.getByText('Mostrar tarifas'))
    const rateSection = document.querySelector('.rate-group-content.expanded')
    if (rateSection) {
      const currencyInputs = rateSection.querySelectorAll('input[inputmode="numeric"]')
      for (const ci of currencyInputs) {
        fireEvent.change(ci, { target: { value: '1,00' } })
        fireEvent.blur(ci)
      }
    }

    await userEvent.click(screen.getByText('Salvar'))

    await waitFor(() => {
      expect(screen.getByText('Create failed')).toBeInTheDocument()
    })
  })

  it('shows error when delete fails', async () => {
    const svc = await import('@services/properties')
    svc.__mocks.deleteMock.mockRejectedValueOnce(new Error('Delete failed'))

    render(<PropertiesPage />)
    expect(await screen.findByText('Pousada Sol')).toBeInTheDocument()

    await userEvent.click(screen.getAllByText('Remover')[0])

    const confirmBtn = await screen.findByText('Remover', { selector: '.btn-danger' })
    await userEvent.click(confirmBtn)

    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument()
    })
  })
})
