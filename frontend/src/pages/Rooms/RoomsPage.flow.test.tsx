import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
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

vi.mock('react-i18next', () => {
  return {
    useTranslation: () => ({
      t: (k: string) => {
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
          // common shared labels
          'common.actions.save': 'Save',
          'common.actions.cancel': 'Cancel',
          'common.actions.edit': 'Edit',
          'common.actions.delete': 'Remove',
          'common.status.error_required': 'Required',
          'common.status.loading': 'Loading...',
          // confirm modal
          'common.confirm.delete_title': 'Delete confirmation',
          'common.confirm.delete_confirm': 'Remove',
          'common.confirm.delete_message_prefix': 'Are you sure you want to remove',
          'common.confirm.delete_message_suffix': 'This action cannot be undone.',
        }
        return map[k] ?? k
      },
    }),
  }
})

vi.mock('@services/rooms', () => {
  const listMock = vi.fn()
  const createMock = vi.fn()
  const updateMock = vi.fn()
  const deleteMock = vi.fn()

  listMock.mockResolvedValue([{ id: 'r-1', name: 'Room A', number: '101' }])

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

import RoomsPage from './RoomsPage'

describe('RoomsPage flows', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders list and creates a room', async () => {
    const svcCreate = await import('@services/rooms')
    svcCreate.__mocks.createMock.mockResolvedValueOnce({ id: 'r-new', name: 'New room', number: '200' })

    render(<RoomsPage />)

    // existing item appears
    expect(await screen.findByText('Room A')).toBeInTheDocument()

    // open create modal
    await userEvent.click(await screen.findByText('New room'))

    // fill name
    const textInputs = await screen.findAllByRole('textbox')
    const nameInput = textInputs[0]
    await userEvent.type(nameInput, 'New room')

    // fill numeric required fields (beds, capacity)
    const numberInputs = await screen.findAllByRole('spinbutton')
    for (const ni of numberInputs) {
      await userEvent.clear(ni)
      await userEvent.type(ni, '1')
    }

    // save
    await userEvent.click(await screen.findByText('Save'))

    await waitFor(async () => {
      const svcAssert = await import('@services/rooms')
      expect(svcAssert.__mocks.createMock).toHaveBeenCalled()
    })
  })


  it('deletes a room after confirm', async () => {
    const svcDelete = await import('@services/rooms')
    svcDelete.__mocks.deleteMock.mockResolvedValueOnce(undefined)

    render(<RoomsPage />)

    expect(await screen.findByText('Room A')).toBeInTheDocument()

    await userEvent.click(screen.getAllByText('Remove')[0])

    // confirm by clicking the confirm button inside the confirm modal
    const confirmBtn = await screen.findByText('Remove', { selector: '.btn-danger' })
    await userEvent.click(confirmBtn)

    await waitFor(async () => {
      const svcAssert = await import('@services/rooms')
      expect(svcAssert.__mocks.deleteMock).toHaveBeenCalled()
    })
  })
})
