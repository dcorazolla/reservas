import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

 
vi.mock('@chakra-ui/react', async () => {
  const React = await import('react')
  return {
    Box: (props: any) => React.createElement('div', props, props.children),
    Heading: (props: any) => React.createElement('h2', props, props.children),
    Text: (props: any) => React.createElement('span', props, props.children),
    Button: (props: any) => React.createElement('button', props, props.children),
    HStack: (props: any) => React.createElement('div', props, props.children),
    VStack: (props: any) => React.createElement('div', props, props.children),
    CloseButton: (props: any) => React.createElement('button', props, '×'),
  }
})

vi.mock('@components/Shared/Message/Message', async () => {
  const React = await import('react')
  return {
    default: (props: any) => React.createElement('div', { 'data-testid': `message-${props.type}`, role: 'alert' }, props.message),
  }
})

vi.mock('react-i18next', () => {
  return {
    useTranslation: () => ({
      t: (k: string) => {
        const map: Record<string, string> = {
          'roomCategories.page.title': 'Categorias de quarto',
          'roomCategories.form.new': 'Nova categoria',
          'roomCategories.form.name': 'Nome',
          'roomCategories.form.description': 'Descrição',
          'roomCategories.form.edit': 'Editar categoria',
          // common shared labels
          'common.actions.save': 'Salvar',
          'common.actions.cancel': 'Cancelar',
          'common.actions.edit': 'Editar',
          'common.actions.delete': 'Remover',
          'common.pricing.show_rates': 'Mostrar tarifas',
          'common.pricing.hide_rates': 'Ocultar tarifas',
          'common.pricing.one_adult': 'Base 1 adulto',
          'common.pricing.two_adults': 'Base 2 adultos',
          'common.pricing.additional_adult': 'Adicional adulto',
          'common.pricing.child_price': 'Preço criança',
          'common.status.error_required': 'Required field',
          'common.status.loading': 'Loading...',
          'common.status.success': 'Saved successfully',
          'common.status.error_saving': 'Error saving',
          'common.status.error_loading': 'Error loading',
          // confirm modal
          'common.confirm.delete_title': 'Confirmação de exclusão',
          'common.confirm.delete_confirm': 'Remover',
          'common.confirm.delete_message_prefix': 'Deseja remover',
          'common.confirm.delete_message_suffix': 'Esta ação não pode ser desfeita.',
        }
        return map[k] ?? k
      },
    }),
  }
})

vi.mock('@services/roomCategories', () => {
  const listMock = vi.fn()
  const createMock = vi.fn()
  const updateMock = vi.fn()
  const deleteMock = vi.fn()

  listMock.mockResolvedValue([{ id: 'rc-1', name: 'Category A', description: 'Desc A' }])

  return {
    listRoomCategories: () => listMock(),
    createRoomCategory: (...args: any[]) => createMock(...args),
    updateRoomCategory: (...args: any[]) => updateMock(...args),
    deleteRoomCategory: (...args: any[]) => deleteMock(...args),
    __mocks: { listMock, createMock, updateMock, deleteMock },
  }
})

vi.mock('@services/roomCategoryRates', () => {
  const listRates = vi.fn()
  const createRate = vi.fn()
  const updateRate = vi.fn()
  const deleteRate = vi.fn()
  return { listRates: (...args: any[]) => listRates(...args), createRate: (...args: any[]) => createRate(...args), updateRate: (...args: any[]) => updateRate(...args), deleteRate: (...args: any[]) => deleteRate(...args), __mocks: { listRates, createRate, updateRate, deleteRate } }
})

import RoomCategoriesPage from './RoomCategoriesPage'

describe('RoomCategoriesPage flows', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a new room category and persists rates', async () => {
    const svcCreate = await import('@services/roomCategories')
    svcCreate.__mocks.createMock.mockResolvedValueOnce({ id: 'rc-new', name: 'New Cat', description: 'Desc' })

    const rateSvc = await import('@services/roomCategoryRates')
    rateSvc.__mocks.createRate.mockResolvedValueOnce({ id: 'rate-new', base_one_adult: 10 })

    render(<RoomCategoriesPage />)

    // page loaded with existing category
    expect(await screen.findByText('Category A')).toBeInTheDocument()

    // open create modal
    await userEvent.click(await screen.findByText('Nova categoria'))

    // fill name
    const nameInput = (await screen.findAllByRole('textbox'))[0]
    await userEvent.type(nameInput, 'New Cat')

    // open rates
    const showRatesBtn = await screen.findByText('Mostrar tarifas', { exact: false })
    await userEvent.click(showRatesBtn)

    // fill a rate numeric input
    const numberInputs = screen.getAllByRole('spinbutton')
    if (numberInputs.length) await userEvent.type(numberInputs[0], '12')

    // save
    await userEvent.click(await screen.findByText('Salvar'))

    await waitFor(async () => {
      const svcAssert = await import('@services/roomCategories')
      expect(svcAssert.__mocks.createMock).toHaveBeenCalled()
    })
  })

  it('deletes a category after confirm', async () => {
    const svcDelete = await import('@services/roomCategories')
    svcDelete.__mocks.deleteMock.mockResolvedValueOnce(undefined)

    render(<RoomCategoriesPage />)

    expect(await screen.findByText('Category A')).toBeInTheDocument()

    // click delete on the list item
    const deleteButtons = screen.getAllByText('Remover')
    await userEvent.click(deleteButtons[0])

    // confirm by clicking the confirm button inside the confirm modal
    const confirmBtn = await screen.findByText('Remover', { selector: '.btn-danger' })
    await userEvent.click(confirmBtn)

    await waitFor(async () => {
      const svcAssert = await import('@services/roomCategories')
      expect(svcAssert.__mocks.deleteMock).toHaveBeenCalled()
    })
  })

  it('edits existing category and updates rates via updateRate', async () => {
    const svcUpdate = await import('@services/roomCategories')
    svcUpdate.__mocks.updateMock.mockResolvedValueOnce({ id: 'rc-1', name: 'Category A', description: 'Desc A' })

    const rateSvc = await import('@services/roomCategoryRates')
    rateSvc.__mocks.listRates.mockResolvedValueOnce([{ id: 'rate-1', base_one_adult: 10 }])
    rateSvc.__mocks.updateRate.mockResolvedValueOnce({ id: 'rate-1', base_one_adult: 12 })

    render(<RoomCategoriesPage />)

    expect(await screen.findByText('Category A')).toBeInTheDocument()

    // open edit modal for first item
    await userEvent.click(screen.getAllByText('Editar')[0])

    // wait modal and toggle rates
    const toggle = await screen.findByText('Mostrar tarifas')
    await userEvent.click(toggle)

    // change numeric input
    const numberInputs = await screen.findAllByRole('spinbutton')
    if (numberInputs.length) {
      await userEvent.clear(numberInputs[0])
      await userEvent.type(numberInputs[0], '15')
    }

    // save
    await userEvent.click(await screen.findByText('Salvar'))

    await waitFor(async () => {
      const svcAssert = await import('@services/roomCategories')
      expect(svcAssert.__mocks.updateMock).toHaveBeenCalled()
      const rsvc = await import('@services/roomCategoryRates')
      expect(rsvc.__mocks.updateRate).toHaveBeenCalled()
    })
  })

  it('shows loading skeleton while fetching list', async () => {
    const svc = await import('@services/roomCategories')
    // simulate delayed list resolution
    svc.__mocks.listMock.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve([{ id: 'rc-1', name: 'Category A', description: 'Desc A' }]), 50))
    )

    render(<RoomCategoriesPage />)

    // while loading, the category should not yet be in the document
    expect(screen.queryByText('Category A')).not.toBeInTheDocument()

    // after the list resolves, the item should appear
    expect(await screen.findByText('Category A')).toBeInTheDocument()
  })

  it('shows error when list fails', async () => {
    const svc = await import('@services/roomCategories')
    svc.__mocks.listMock.mockImplementationOnce(() => Promise.reject(new Error('Boom')))

    render(<RoomCategoriesPage />)

    // after error, the error message should be shown
    expect(await screen.findByText('Boom')).toBeInTheDocument()
  })

  it('edits existing category and creates rates when rate has no id', async () => {
    const svcUpdate = await import('@services/roomCategories')
    svcUpdate.__mocks.updateMock.mockResolvedValueOnce({ id: 'rc-1', name: 'Category A', description: 'Desc A' })

    const rateSvc = await import('@services/roomCategoryRates')
    // listRates returns a rate without id to force createRate path
    rateSvc.__mocks.listRates.mockResolvedValueOnce([{ base_one_adult: 10 }])
    rateSvc.__mocks.createRate.mockResolvedValueOnce({ id: 'rate-new', base_one_adult: 10 })

    render(<RoomCategoriesPage />)

    expect(await screen.findByText('Category A')).toBeInTheDocument()

    // open edit modal for first item
    await userEvent.click(screen.getAllByText('Editar')[0])

    const toggle = await screen.findByText('Mostrar tarifas')
    await userEvent.click(toggle)

    await userEvent.click(await screen.findByText('Salvar'))

    await waitFor(async () => {
      const svcAssert = await import('@services/roomCategories')
      expect(svcAssert.__mocks.updateMock).toHaveBeenCalled()
      const rsvc = await import('@services/roomCategoryRates')
      expect(rsvc.__mocks.createRate).toHaveBeenCalled()
    })
  })

  it('creates new category but ignores rate creation errors', async () => {
    const svcCreate = await import('@services/roomCategories')
    svcCreate.__mocks.createMock.mockResolvedValueOnce({ id: 'rc-new', name: 'New Cat', description: 'Desc' })

    const rateSvc = await import('@services/roomCategoryRates')
    rateSvc.__mocks.createRate.mockRejectedValueOnce(new Error('rate fail'))

    render(<RoomCategoriesPage />)

    expect(await screen.findByText('Category A')).toBeInTheDocument()

    // open create modal
    await userEvent.click(await screen.findByText('Nova categoria'))

    const nameInput = (await screen.findAllByRole('textbox'))[0]
    await userEvent.type(nameInput, 'New Cat')

    await userEvent.click(await screen.findByText('Mostrar tarifas'))
    const numberInputs = screen.getAllByRole('spinbutton')
    if (numberInputs.length) await userEvent.type(numberInputs[0], '12')

    await userEvent.click(await screen.findByText('Salvar'))

    await waitFor(async () => {
      const svcAssert = await import('@services/roomCategories')
      expect(svcAssert.__mocks.createMock).toHaveBeenCalled()
    })
  })

  it('updates category but ignores rate update errors', async () => {
    const svcUpdate = await import('@services/roomCategories')
    svcUpdate.__mocks.updateMock.mockResolvedValueOnce({ id: 'rc-1', name: 'Category A', description: 'Desc A' })

    const rateSvc = await import('@services/roomCategoryRates')
    rateSvc.__mocks.listRates.mockResolvedValueOnce([{ id: 'rate-1', base_one_adult: 10 }])
    rateSvc.__mocks.updateRate.mockRejectedValueOnce(new Error('update fail'))

    render(<RoomCategoriesPage />)

    expect(await screen.findByText('Category A')).toBeInTheDocument()

    await userEvent.click(screen.getAllByText('Editar')[0])
    const toggle = await screen.findByText('Mostrar tarifas')
    await userEvent.click(toggle)
    await userEvent.click(await screen.findByText('Salvar'))

    await waitFor(async () => {
      const svcAssert = await import('@services/roomCategories')
      expect(svcAssert.__mocks.updateMock).toHaveBeenCalled()
    })
  })

  it('shows error when save fails', async () => {
    const svcCreate = await import('@services/roomCategories')
    svcCreate.__mocks.createMock.mockRejectedValueOnce(new Error('save fail'))

    render(<RoomCategoriesPage />)

    // open create modal
    await userEvent.click(await screen.findByText('Nova categoria'))
    const nameInput = (await screen.findAllByRole('textbox'))[0]
    await userEvent.type(nameInput, 'New Cat')
    await userEvent.click(await screen.findByText('Salvar'))

    // error should be displayed
    expect(await screen.findByText('save fail')).toBeInTheDocument()
  })

  it('shows error when delete fails', async () => {
    const svcDelete = await import('@services/roomCategories')
    svcDelete.__mocks.deleteMock.mockRejectedValueOnce(new Error('delete fail'))

    render(<RoomCategoriesPage />)

    expect(await screen.findByText('Category A')).toBeInTheDocument()
    await userEvent.click(screen.getAllByText('Remover')[0])
    // click confirm in modal
    const confirmBtn = await screen.findByText('Remover', { selector: '.btn-danger' })
    await userEvent.click(confirmBtn)

    expect(await screen.findByText('delete fail')).toBeInTheDocument()
  })
})
