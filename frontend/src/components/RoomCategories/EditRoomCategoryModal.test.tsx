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

    // open rates toggle
    const toggle = screen.getByRole('button', { name: /Show rates|roomCategories.form.show_rates|/i, hidden: true }) || screen.getByText('Show rates', { exact: false })
    if (toggle) {
      await userEvent.click(toggle)
    }

    // change a rate input
    const inputs = screen.getAllByRole('spinbutton')
    if (inputs.length) {
      await userEvent.clear(inputs[0])
      await userEvent.type(inputs[0], '33')
    }

    // click save
    const saveBtn = screen.getByText(/roomCategories.form.save|Save|Salvar|/i)
    await userEvent.click(saveBtn)

    await waitFor(() => expect(onSave).toHaveBeenCalled())
    const payload = onSave.mock.calls[0][0]
    expect(payload).toHaveProperty('_rates')
  })
})
