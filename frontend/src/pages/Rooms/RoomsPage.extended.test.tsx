import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: any) => {
      if (k === 'common.pricing.price_n_people' && opts?.count != null) {
        return `Price for ${opts.count} person(s)`
      }
      const map: Record<string, string> = {
        'rooms.page.title': 'Rooms',
        'rooms.form.new': 'New room',
        'rooms.form.create': 'New room',
        'rooms.form.edit': 'Edit room',
        'rooms.form.name': 'Name',
        'rooms.form.number': 'Number',
        'rooms.form.beds': 'Beds',
        'rooms.form.capacity': 'Capacity',
        'rooms.form.notes': 'Notes',
        'rooms.form.category': 'Category',
        'rooms.form.category_placeholder': 'Select category',
        'rooms.form.rate_group_title': 'Room rates',
        'rooms.errors.save': 'Failed to save',
        'rooms.errors.load': 'Failed to load',
        'common.actions.save': 'Save',
        'common.actions.cancel': 'Cancel',
        'common.actions.edit': 'Edit',
        'common.actions.delete': 'Remove',
        'common.status.error_required': 'Required field',
        'common.status.loading': 'Loading...',
        'common.status.success': 'Saved successfully',
        'common.status.error_saving': 'Error saving',
        'common.status.error_loading': 'Error loading',
        'common.pricing.show_rates': 'Show rates',
        'common.pricing.hide_rates': 'Hide rates',
        'common.confirm.delete_title': 'Confirm',
        'common.confirm.delete_confirm': 'Remove',
        'common.confirm.delete_message_prefix': 'Remove',
        'common.confirm.delete_message_suffix': '?',
      }
      return map[k] ?? k
    },
  }),
}))

vi.mock('@services/rooms', () => {
  const listMock = vi.fn()
  const createMock = vi.fn()
  const updateMock = vi.fn()
  const deleteMock = vi.fn()
  listMock.mockResolvedValue([{ id: 'r-1', name: 'Room A', number: '101', beds: 2, capacity: 3 }])
  // Provide default values for mocks so they resolve to empty objects
  createMock.mockResolvedValue({})
  updateMock.mockResolvedValue({})
  deleteMock.mockResolvedValue(undefined)
  return {
    listRooms: () => listMock(),
    createRoom: (...args: any[]) => createMock(...args),
    updateRoom: (...args: any[]) => updateMock(...args),
    deleteRoom: (...args: any[]) => deleteMock(...args),
    __mocks: { listMock, createMock, updateMock, deleteMock },
  }
})

vi.mock('@services/roomCategories', () => {
  const listMock = vi.fn()
  listMock.mockResolvedValue([{ id: 'rc-1', name: 'Category A' }])
  return { listRoomCategories: () => listMock(), __mocks: { listMock } }
})

vi.mock('@services/roomRates', () => {
  const listRatesMock = vi.fn().mockResolvedValue([])
  const createRateMock = vi.fn().mockResolvedValue({})
  const updateRateMock = vi.fn().mockResolvedValue({})
  const deleteRateMock = vi.fn().mockResolvedValue(undefined)
  return {
    listRates: (...args: any[]) => listRatesMock(...args),
    createRate: (...args: any[]) => createRateMock(...args),
    updateRate: (...args: any[]) => updateRateMock(...args),
    deleteRate: (...args: any[]) => deleteRateMock(...args),
    __mocks: { listRatesMock, createRateMock, updateRateMock, deleteRateMock },
  }
})

import RoomsPage from './RoomsPage'

describe('RoomsPage extended flows', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows loading skeletons while fetching', async () => {
    const svc = await import('@services/rooms')
    svc.__mocks.listMock.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve([{ id: 'r-1', name: 'Room A', number: '101' }]), 50))
    )

    render(<RoomsPage />)
    expect(screen.queryByText('Room A')).not.toBeInTheDocument()
    expect(await screen.findByText('Room A')).toBeInTheDocument()
  })

  it('shows error when list fails', async () => {
    const svc = await import('@services/rooms')
    svc.__mocks.listMock.mockRejectedValueOnce(new Error('Network error'))

    render(<RoomsPage />)
    expect(await screen.findByText('Network error')).toBeInTheDocument()
  })

  it('shows error when save fails', async () => {
    const svc = await import('@services/rooms')
    svc.__mocks.createMock.mockRejectedValueOnce(new Error('Save failed'))

    render(<RoomsPage />)
    expect(await screen.findByText('Room A')).toBeInTheDocument()

    await userEvent.click(screen.getByText('New room'))

    const textInputs = await screen.findAllByRole('textbox')
    await userEvent.type(textInputs[0], 'New Room')

    const numberInputs = await screen.findAllByRole('spinbutton')
    for (const ni of numberInputs) {
      await userEvent.clear(ni)
      await userEvent.type(ni, '1')
    }

    await userEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument()
    })
  })

  it('shows error when delete fails', async () => {
    const svc = await import('@services/rooms')
    svc.__mocks.deleteMock.mockRejectedValueOnce(new Error('Delete failed'))

    render(<RoomsPage />)
    expect(await screen.findByText('Room A')).toBeInTheDocument()

    await userEvent.click(screen.getAllByText('Remove')[0])

    const confirmBtn = await screen.findByText('Remove', { selector: '.btn-danger' })
    await userEvent.click(confirmBtn)

    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument()
    })
  })

  it('edits an existing room via update', async () => {
    const svc = await import('@services/rooms')
    svc.__mocks.updateMock.mockResolvedValueOnce({ id: 'r-1', name: 'Room A Updated', number: '101', beds: 2, capacity: 3 })

    render(<RoomsPage />)
    expect(await screen.findByText('Room A')).toBeInTheDocument()

    await userEvent.click(screen.getAllByText('Edit')[0])

    const nameInput = (await screen.findAllByRole('textbox'))[0]
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Room A Updated')

    // Only update beds and capacity (the first two spinbuttons), not rate fields
    const allSpinbuttons = await screen.findAllByRole('spinbutton')
    const bedsInput = allSpinbuttons[0]
    const capacityInput = allSpinbuttons[1]
    await userEvent.clear(bedsInput)
    await userEvent.type(bedsInput, '2')
    await userEvent.clear(capacityInput)
    await userEvent.type(capacityInput, '2')

    await userEvent.click(screen.getByText('Save'))

    await waitFor(async () => {
      const svcAssert = await import('@services/rooms')
      expect(svcAssert.__mocks.updateMock).toHaveBeenCalled()
    })

    expect(await screen.findByText('Room A Updated')).toBeInTheDocument()
  })
})
