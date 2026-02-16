import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Service mocks will be created inside the factory and exposed via `__mocks`.

// Mock Chakra UI used by the page/modal
vi.mock('@chakra-ui/react', async () => {
  const React = await import('react')
  return {
    Box: (props: any) => React.createElement('div', props, props.children),
    Heading: (props: any) => React.createElement('h2', props, props.children),
    List: (props: any) => React.createElement('ul', props, props.children),
    ListItem: (props: any) => React.createElement('li', props, props.children),
    Text: (props: any) => React.createElement('span', props, props.children),
    Button: (props: any) => React.createElement('button', props, props.children),
    Skeleton: (props: any) => React.createElement('div', props, props.children),
    VStack: (props: any) => React.createElement('div', props, props.children),
    HStack: (props: any) => React.createElement('div', props, props.children),
  }
})

// We'll mock i18n to return Portuguese labels used in tests
vi.mock('react-i18next', () => {
  return {
    useTranslation: () => ({
      t: (k: string) => {
        const map: Record<string, string> = {
          'properties.page.title': 'Propriedades',
          'properties.form.new': 'Nova propriedade',
          'properties.form.name': 'Nome',
          'properties.form.timezone': 'Timezone',
          'properties.form.save': 'Salvar',
          'properties.form.cancel': 'Cancelar',
          'properties.actions.edit': 'Editar',
          'properties.actions.delete': 'Remover',
          'properties.confirm.delete_title': 'Confirmação de exclusão',
          'properties.confirm.delete_confirm': 'Remover',
          'properties.form.base_rates_title': 'Tarifa Base',
          'properties.form.show_base_rates': 'Mostrar tarifas',
          'properties.form.hide_base_rates': 'Ocultar tarifas',
          'properties.form.child_factor': 'Fator criança',
          'properties.form.child_price': 'Preço criança',
          'properties.form.base_one_adult': 'Base 1 adulto',
          'properties.form.base_two_adults': 'Base 2 adultos',
          'properties.form.additional_adult': 'Adicional adulto',
          'properties.form.infant_max_age': 'Idade máxima (infantes)',
          'properties.form.child_max_age': 'Idade máxima (crianças)',
          'properties.form.error_required': 'Campo obrigatório',
        }
        return map[k] ?? k
      },
    }),
  }
})

vi.mock('@services/properties', () => {
  const listMock = vi.fn()
  const createMock = vi.fn()
  const updateMock = vi.fn()
  const deleteMock = vi.fn()

  // default list returns two items
  listMock.mockResolvedValue([
    { id: 'p-1', name: 'Pousada Sol', timezone: 'Europe/Lisbon' },
    { id: 'p-2', name: 'Hotel Mar', timezone: 'Europe/Paris' },
  ])

  return {
    listProperties: () => listMock(),
    createProperty: (...args: any[]) => createMock(...args),
    updateProperty: (...args: any[]) => updateMock(...args),
    deleteProperty: (...args: any[]) => deleteMock(...args),
    __mocks: { listMock, createMock, updateMock, deleteMock },
  }
})

import PropertiesPage from './PropertiesPage'

describe('PropertiesPage flows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a new property (validation -> fill -> create)', async () => {
    // prepare create to resolve
    const svcCreate = await import('@services/properties')
    svcCreate.__mocks.createMock.mockResolvedValueOnce({ id: 'p-new', name: 'Nova', timezone: 'UTC' })

    render(<PropertiesPage />)

    // page loaded
    expect(await screen.findByText('Pousada Sol')).toBeInTheDocument()

    // open create modal
    userEvent.click(screen.getByText('Nova propriedade'))

    // click save without filling should show validation errors (inputs are required)
    userEvent.click(await screen.findByText('Salvar'))

    // expect error text appears
    expect(await screen.findAllByText('Campo obrigatório')).toHaveLength(8)

    // fill required fields (simple minimal values)
    const inputs = screen.getAllByRole('textbox')
    // first textbox is name
    await userEvent.type(inputs[0], 'Nova')

    // numeric inputs: fill with '1' for each remaining
    const numberInputs = screen.getAllByRole('spinbutton')
    for (const ni of numberInputs) {
      await userEvent.clear(ni)
      await userEvent.type(ni, '1')
    }

    // select timezone (native select)
    const selects = screen.getAllByRole('combobox')
    if (selects.length) await userEvent.selectOptions(selects[0], 'UTC')

    // click save again
    await userEvent.click(screen.getByText('Salvar'))

    await waitFor(async () => {
      const svcAssert = await import('@services/properties')
      expect(svcAssert.__mocks.createMock).toHaveBeenCalled()
    })

    // after create, created item should be in the list
    expect(await screen.findByText('Nova')).toBeInTheDocument()
  })

  it('edits an existing property and updates list', async () => {
    // prepare update mock
    const svcUpdate = await import('@services/properties')
    svcUpdate.__mocks.updateMock.mockResolvedValueOnce({ id: 'p-1', name: 'Pousada Sol Updated', timezone: 'Europe/Lisbon' })

    render(<PropertiesPage />)

    // wait initial load
    expect(await screen.findByText('Pousada Sol')).toBeInTheDocument()

    // open edit for first row
    userEvent.click(screen.getAllByText('Editar')[0])

    // modal should show name input prefilled
    const nameInput = await screen.findByRole('textbox')
    expect((nameInput as HTMLInputElement).value).toBe('Pousada Sol')

    // change name
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Pousada Sol Updated')

    // save
    // fill remaining required numeric fields before saving
    const numberInputsEdit = screen.getAllByRole('spinbutton')
    for (const ni of numberInputsEdit) {
      await userEvent.clear(ni)
      await userEvent.type(ni, '1')
    }

    await userEvent.click(screen.getByText('Salvar'))

    await waitFor(async () => {
      const svcAssert = await import('@services/properties')
      expect(svcAssert.__mocks.updateMock).toHaveBeenCalled()
    })

    // updated name visible
    expect(await screen.findByText('Pousada Sol Updated')).toBeInTheDocument()
  })

  it('deletes a property after confirming', async () => {
    const svcDelete = await import('@services/properties')
    svcDelete.__mocks.deleteMock.mockResolvedValueOnce(undefined)

    render(<PropertiesPage />)

    expect(await screen.findByText('Pousada Sol')).toBeInTheDocument()

    // click remove on first row
    await userEvent.click(screen.getAllByText('Remover')[0])

    // confirm modal has remove button; there are multiple 'Remover' buttons
    const removerButtons = await screen.findAllByText('Remover')
    // click the last one which belongs to the confirm dialog
    await userEvent.click(removerButtons[removerButtons.length - 1])

    await waitFor(async () => {
      const svcAssert = await import('@services/properties')
      expect(svcAssert.__mocks.deleteMock).toHaveBeenCalled()
    })

    // ensure the list no longer contains the removed property
    const list = screen.getByRole('list')
    await waitFor(() => expect(within(list).queryByText('Pousada Sol')).not.toBeInTheDocument())
  })
})
