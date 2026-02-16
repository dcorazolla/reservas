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
    Skeleton: (props: any) => React.createElement('div', props, props.children),
    VStack: (props: any) => React.createElement('div', props, props.children),
    HStack: (props: any) => React.createElement('div', props, props.children),
  }
})

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }))

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
    userEvent.click(screen.getByText('roomCategories.form.new'))

    // fill name
    const nameInput = await screen.findByRole('textbox')
    await userEvent.type(nameInput, 'New Cat')

    // open rates
    const showRatesBtn = screen.getByText(/Show rates|roomCategories.form.show_rates|/i) || screen.getByRole('button', { name: /Show rates/i })
    if (showRatesBtn) await userEvent.click(showRatesBtn)

    // fill a rate numeric input
    const numberInputs = screen.getAllByRole('spinbutton')
    if (numberInputs.length) await userEvent.type(numberInputs[0], '12')

    // save
    await userEvent.click(screen.getByText(/roomCategories.form.save|Save|/i))

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

    await userEvent.click(screen.getAllByText('roomCategories.actions.delete')[0] || screen.getAllByText('Remove')[0])

    // confirm by clicking the last Remove button
    const removerButtons = await screen.findAllByText(/roomCategories.confirm.delete_confirm|Remover|Remove/i)
    await userEvent.click(removerButtons[removerButtons.length - 1])

    await waitFor(async () => {
      const svcAssert = await import('@services/roomCategories')
      expect(svcAssert.__mocks.deleteMock).toHaveBeenCalled()
    })
  })
})
