import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('@chakra-ui/react', async () => {
  const React = await import('react')
  return {
    Box: (props: any) => React.createElement('div', props, props.children),
    Button: (props: any) => React.createElement('button', props, props.children),
  }
})

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }))

vi.mock('@services/roomCategoryRates', () => {
  const listRates = vi.fn()
  return { listRates: (...args: any[]) => listRates(...args), __mocks: { listRates } }
})

import EditRoomCategoryModal from './EditRoomCategoryModal'

describe('EditRoomCategoryModal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads rates when editing and returns payload with _rates on save', async () => {
    const svc = await import('@services/roomCategoryRates')
    svc.__mocks.listRates.mockResolvedValueOnce([{ id: 'rate-1', base_one_adult: 10, base_two_adults: 20, additional_adult: 5, child_price: 2 }])

    const onSave = vi.fn()
    const onClose = vi.fn()

    render(<EditRoomCategoryModal isOpen={true} category={{ id: 'rc-1', name: 'Cat A', description: 'Desc' }} onClose={onClose} onSave={onSave} />)

    // wait for rate to be loaded and visible
    await waitFor(() => expect(svc.__mocks.listRates).toHaveBeenCalledWith('rc-1'))

    // open rates toggle (use exact i18n key string)
    const toggle = screen.getByText('common.pricing.show_rates')
    await userEvent.click(toggle)

    // change a rate input
    const inputs = screen.getAllByRole('spinbutton')
    if (inputs.length) {
      await userEvent.clear(inputs[0])
      await userEvent.type(inputs[0], '33')
    }

    // click save
    const saveBtn = screen.getByText('common.actions.save')
    await userEvent.click(saveBtn)

    await waitFor(() => expect(onSave).toHaveBeenCalled())
    const payload = onSave.mock.calls[0][0]
    expect(payload).toHaveProperty('_rates')
  })

  it('shows loading state while fetching rates', async () => {
    const svc = await import('@services/roomCategoryRates')
    // simulate delayed response
    svc.__mocks.listRates.mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve([{ id: 'rate-1', base_one_adult: 10 }]), 50)))

    const onSave = vi.fn()
    const onClose = vi.fn()

    render(<EditRoomCategoryModal isOpen={true} category={{ id: 'rc-1', name: 'Cat A', description: 'Desc' }} onClose={onClose} onSave={onSave} />)

    // while the rates promise is pending, the loading placeholder should be visible
    expect(screen.getByTestId('skeleton-fields')).toBeInTheDocument()

    // after resolution, listRates should have been called
    await waitFor(() => expect(svc.__mocks.listRates).toHaveBeenCalled())
  })

  it('returns _rates with null fields when creating and no rates present', async () => {
    const onSave = vi.fn()
    const onClose = vi.fn()

    render(<EditRoomCategoryModal isOpen={true} category={null} onClose={onClose} onSave={onSave} />)

    // Fill required name field (zod schema requires it)
    const nameInput = screen.getAllByRole('textbox')[0]
    await userEvent.type(nameInput, 'New Category')

    // open rates group
    const toggle = screen.getByText('common.pricing.show_rates')
    await userEvent.click(toggle)

    // save without entering rate numbers
    const saveBtn = screen.getByText('common.actions.save')
    await userEvent.click(saveBtn)

    await waitFor(() => expect(onSave).toHaveBeenCalled())
    const payload = onSave.mock.calls[0][0]
    expect(payload).toHaveProperty('_rates')
    expect(payload._rates.base_one_adult).toBeNull()
    expect(payload._rates.base_two_adults).toBeNull()
    expect(payload._rates.additional_adult).toBeNull()
    expect(payload._rates.child_price).toBeNull()
  })

  it('fills all numeric rate fields and saves with numeric values', async () => {
    const svc = await import('@services/roomCategoryRates')
    svc.__mocks.listRates.mockResolvedValueOnce([{ id: 'rate-1', base_one_adult: 1, base_two_adults: 2, additional_adult: 3, child_price: 4 }])

    const onSave = vi.fn()
    const onClose = vi.fn()

    render(<EditRoomCategoryModal isOpen={true} category={{ id: 'rc-1', name: 'Cat A', description: 'Desc' }} onClose={onClose} onSave={onSave} />)

    // wait for rates to be loaded
    await waitFor(() => expect(svc.__mocks.listRates).toHaveBeenCalled())

    // open rates
    const toggle = screen.getByText('common.pricing.show_rates')
    await userEvent.click(toggle)

    const numberInputs = screen.getAllByRole('spinbutton')
    // fill each numeric input
    for (let i = 0; i < numberInputs.length; i++) {
      await userEvent.clear(numberInputs[i])
      await userEvent.type(numberInputs[i], String((i + 1) * 10))
    }

    await userEvent.click(screen.getByText('common.actions.save'))

    await waitFor(() => expect(onSave).toHaveBeenCalled())
    const payload = onSave.mock.calls[0][0]
    expect(payload._rates.base_one_adult).toBe(10)
    expect(payload._rates.base_two_adults).toBe(20)
    expect(payload._rates.additional_adult).toBe(30)
    expect(payload._rates.child_price).toBe(40)
  })

  it('handles listRates rejection gracefully and logs error', async () => {
    const svc = await import('@services/roomCategoryRates')
    svc.__mocks.listRates.mockRejectedValueOnce(new Error('list fail'))

    const onSave = vi.fn()
    const onClose = vi.fn()

    const spy = vi.spyOn(console, 'error')

    render(<EditRoomCategoryModal isOpen={true} category={{ id: 'rc-1', name: 'Cat A', description: 'Desc' }} onClose={onClose} onSave={onSave} />)

    await waitFor(() => expect(svc.__mocks.listRates).toHaveBeenCalled())
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('toggles rates display, edits description and cancels', async () => {
    const onSave = vi.fn()
    const onClose = vi.fn()

    render(<EditRoomCategoryModal isOpen={true} category={null} onClose={onClose} onSave={onSave} />)

    // toggle open rates, then close
    const toggle = screen.getByText('common.pricing.show_rates')
    await userEvent.click(toggle)
    // now it should show hide label
    expect(screen.getByText('common.pricing.hide_rates')).toBeInTheDocument()

    // change description (second textbox is the textarea)
    const textboxes = screen.getAllByRole('textbox')
    const textarea = textboxes[1]
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'My desc')

    // cancel should call onClose and not call onSave
    const cancelBtn = screen.getByText('common.actions.cancel')
    await userEvent.click(cancelBtn)
    expect(onClose).toHaveBeenCalled()
    expect(onSave).not.toHaveBeenCalled()
  })
})
