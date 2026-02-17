import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@chakra-ui/react', async () => {
  const React = await import('react')
  return {
    Box: (props: any) => React.createElement('div', props, props.children),
    Button: (props: any) => React.createElement('button', props, props.children),
    Skeleton: (props: any) => React.createElement('div', { 'data-testid': 'skeleton', ...props }, 'loading'),
    VStack: (props: any) => React.createElement('div', props, props.children),
  }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
  }),
}))

vi.mock('@services/roomCategories', () => {
  const listMock = vi.fn()
  listMock.mockResolvedValue([{ id: 'rc-1', name: 'Category A' }])
  return { listRoomCategories: () => listMock(), __mocks: { listMock } }
})

import EditRoomModal from './EditRoomModal'

describe('EditRoomModal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders create form and saves', async () => {
    const onSave = vi.fn()
    const onClose = vi.fn()

    render(<EditRoomModal isOpen={true} room={null} onClose={onClose} onSave={onSave} />)

    // wait for categories to load and render in select
    await waitFor(() => {
      expect(screen.getByText('rooms.form.name')).toBeInTheDocument()
      // ensure categories rendered in select (covers lines 88-93)
      expect(screen.getByText('Category A')).toBeInTheDocument()
    })

    const textInputs = screen.getAllByRole('textbox')
    await userEvent.type(textInputs[0], 'New Room')

    const numberInputs = screen.getAllByRole('spinbutton')
    for (const ni of numberInputs) {
      await userEvent.clear(ni)
      await userEvent.type(ni, '2')
    }

    await userEvent.click(screen.getByText('common.actions.save'))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })

    const payload = onSave.mock.calls[0][0]
    expect(payload.name).toBe('New Room')
    expect(payload.beds).toBe(2)
    expect(payload.capacity).toBe(2)
  })

  it('shows validation errors when name is empty', async () => {
    const onSave = vi.fn()
    const onClose = vi.fn()

    render(<EditRoomModal isOpen={true} room={null} onClose={onClose} onSave={onSave} />)

    await waitFor(() => {
      expect(screen.getByText('rooms.form.name')).toBeInTheDocument()
    })

    // clear name and beds
    const textInputs = screen.getAllByRole('textbox')
    await userEvent.clear(textInputs[0]) // name empty

    // clear beds to make it invalid
    const numberInputs = screen.getAllByRole('spinbutton')
    await userEvent.clear(numberInputs[0]) // beds empty
    await userEvent.clear(numberInputs[1]) // capacity empty

    // submit via fireEvent.submit on the form to ensure handleSubmit fires
    const form = screen.getByText('common.actions.save').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      // onSave should NOT have been called because validation failed
      expect(onSave).not.toHaveBeenCalled()

      // error messages should be visible for all three fields (name, beds, capacity)
      const errorDivs = screen.getAllByText('common.status.error_required')
      expect(errorDivs.length).toBeGreaterThanOrEqual(3)
    })

    // Verify individual field-error divs exist (covers lines 106 and 115)
    const fieldErrors = document.querySelectorAll('.field-error')
    expect(fieldErrors.length).toBeGreaterThanOrEqual(2) // beds + capacity
  })

  it('renders loading state', async () => {
    const onSave = vi.fn()
    const onClose = vi.fn()

    render(<EditRoomModal isOpen={true} room={null} onClose={onClose} onSave={onSave} loading={true} />)

    expect(screen.getByText('common.status.loading')).toBeInTheDocument()
  })

  it('prefills form when editing existing room', async () => {
    const onSave = vi.fn()
    const onClose = vi.fn()
    const room = { id: 'r-1', name: 'Existing', number: '101', room_category_id: 'rc-1', beds: 3, capacity: 4, active: true, notes: 'Some notes' }

    render(<EditRoomModal isOpen={true} room={room} onClose={onClose} onSave={onSave} />)

    await waitFor(() => {
      expect(screen.getByText('rooms.form.edit')).toBeInTheDocument()
    })

    const textInputs = screen.getAllByRole('textbox')
    expect((textInputs[0] as HTMLInputElement).value).toBe('Existing')
  })

  it('calls onClose on cancel', async () => {
    const onSave = vi.fn()
    const onClose = vi.fn()

    render(<EditRoomModal isOpen={true} room={null} onClose={onClose} onSave={onSave} />)

    await waitFor(() => {
      expect(screen.getByText('rooms.form.name')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText('common.actions.cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders categories in select dropdown and interacts with fields', async () => {
    render(<EditRoomModal isOpen={true} room={null} onClose={vi.fn()} onSave={vi.fn()} />)
    await waitFor(() => {
      // Category A should appear as an option in the select
      const option = screen.getByText('Category A')
      expect(option).toBeInTheDocument()
      expect(option.tagName).toBe('OPTION')
    })
    // Also verify the placeholder option
    expect(screen.getByText('rooms.form.category_placeholder')).toBeInTheDocument()

    // Change the number field (covers line 88 onChange callback)
    const inputs = screen.getAllByRole('textbox')
    const numberInput = inputs[1] // second textbox is number
    await userEvent.type(numberInput, '202')
    expect((numberInput as HTMLInputElement).value).toBe('202')

    // Change the category select (covers lines 92-93 onChange callback)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'rc-1' } })
    expect((select as HTMLSelectElement).value).toBe('rc-1')

    // Change the notes textarea (covers notes onChange)
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    await userEvent.type(textarea, 'some notes')
    expect(textarea.value).toBe('some notes')
  })

  it('handles category loading failure gracefully', async () => {
    const catSvc = await import('@services/roomCategories')
    catSvc.__mocks.listMock.mockRejectedValueOnce(new Error('cat fail'))

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onSave = vi.fn()
    const onClose = vi.fn()

    render(<EditRoomModal isOpen={true} room={null} onClose={onClose} onSave={onSave} />)

    await waitFor(() => {
      expect(spy).toHaveBeenCalled()
    })
    spy.mockRestore()
  })
})
