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
  }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: any) => {
      const map: Record<string, string> = {
        'common.pricing.one_adult': 'Price 1 adult',
        'common.pricing.two_adults': 'Price 2 adults',
        'common.pricing.trhee_adults': 'Price 3 adults',
        'common.pricing.four_adults': 'Price 4 adults',
      }
      if (map[k]) return map[k]
      if (k === 'common.pricing.price_n_people' && opts?.count != null) {
        return `Price for ${opts.count} person(s)`
      }
      return k
    },
  }),
}))

vi.mock('@services/roomCategories', () => {
  const listMock = vi.fn()
  listMock.mockResolvedValue([{ id: 'rc-1', name: 'Category A' }])
  return { listRoomCategories: () => listMock(), __mocks: { listMock } }
})

vi.mock('@services/roomRates', () => {
  const listRatesMock = vi.fn().mockResolvedValue([])
  return {
    listRates: (...args: any[]) => listRatesMock(...args),
    createRate: vi.fn().mockResolvedValue({}),
    updateRate: vi.fn().mockResolvedValue({}),
    deleteRate: vi.fn().mockResolvedValue(undefined),
    __mocks: { listRatesMock },
  }
})

import EditRoomModal from './EditRoomModal'

describe('EditRoomModal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders create form and saves', async () => {
    const onSave = vi.fn()
    const onClose = vi.fn()

    render(<EditRoomModal isOpen={true} room={null} onClose={onClose} onSave={onSave} />)

    await waitFor(() => {
      expect(screen.getByText('rooms.form.name')).toBeInTheDocument()
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

    const textInputs = screen.getAllByRole('textbox')
    await userEvent.clear(textInputs[0])

    const numberInputs = screen.getAllByRole('spinbutton')
    await userEvent.clear(numberInputs[0])
    await userEvent.clear(numberInputs[1])

    const form = screen.getByText('common.actions.save').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(onSave).not.toHaveBeenCalled()
      const fieldErrors = document.querySelectorAll('.field-error')
      expect(fieldErrors.length).toBeGreaterThanOrEqual(3)
    })
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
      const option = screen.getByText('Category A')
      expect(option).toBeInTheDocument()
      expect(option.tagName).toBe('OPTION')
    })
    expect(screen.getByText('rooms.form.category_placeholder')).toBeInTheDocument()

    const inputs = screen.getAllByRole('textbox')
    const numberInput = inputs[1]
    await userEvent.type(numberInput, '202')
    expect((numberInput as HTMLInputElement).value).toBe('202')

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'rc-1' } })
    expect((select as HTMLSelectElement).value).toBe('rc-1')

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

  // --- Rate toggle tests ---

  it('shows rate toggle and opens rates section', async () => {
    render(<EditRoomModal isOpen={true} room={null} onClose={vi.fn()} onSave={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('rooms.form.rate_group_title')).toBeInTheDocument()
    })

    const toggle = screen.getByText('common.pricing.show_rates')
    await userEvent.click(toggle)
    expect(screen.getByText('common.pricing.hide_rates')).toBeInTheDocument()
  })

  it('renders rate fields matching default capacity of 1', async () => {
    render(<EditRoomModal isOpen={true} room={null} onClose={vi.fn()} onSave={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('rooms.form.name')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText('common.pricing.show_rates'))

    expect(screen.getByText('Price 1 adult')).toBeInTheDocument()
    expect(screen.getByTestId('rate-1')).toBeInTheDocument()
    expect(screen.queryByTestId('rate-2')).not.toBeInTheDocument()
  })

  it('dynamically adjusts rate fields when capacity changes', async () => {
    render(<EditRoomModal isOpen={true} room={null} onClose={vi.fn()} onSave={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText('rooms.form.name')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByText('common.pricing.show_rates'))
    expect(screen.getByTestId('rate-1')).toBeInTheDocument()
    expect(screen.queryByTestId('rate-3')).not.toBeInTheDocument()

    // change capacity to 3
    const spinbuttons = screen.getAllByRole('spinbutton')
    const capacityInput = spinbuttons[1]
    await userEvent.clear(capacityInput)
    await userEvent.type(capacityInput, '3')

    expect(screen.getByTestId('rate-1')).toBeInTheDocument()
    expect(screen.getByTestId('rate-2')).toBeInTheDocument()
    expect(screen.getByTestId('rate-3')).toBeInTheDocument()
    expect(screen.queryByTestId('rate-4')).not.toBeInTheDocument()

    expect(screen.getByText('Price 1 adult')).toBeInTheDocument()
    expect(screen.getByText('Price 2 adults')).toBeInTheDocument()
    expect(screen.getByText('Price 3 adults')).toBeInTheDocument()
  })

  it('includes _rates in payload when rates section is open', async () => {
    const onSave = vi.fn()
    const onClose = vi.fn()

    render(<EditRoomModal isOpen={true} room={null} onClose={onClose} onSave={onSave} />)

    await waitFor(() => {
      expect(screen.getByText('rooms.form.name')).toBeInTheDocument()
    })

    const textInputs = screen.getAllByRole('textbox')
    await userEvent.type(textInputs[0], 'Room X')

    const spinbuttons = screen.getAllByRole('spinbutton')
    await userEvent.clear(spinbuttons[1])
    await userEvent.type(spinbuttons[1], '2')

    await userEvent.click(screen.getByText('common.pricing.show_rates'))

    fireEvent.change(screen.getByTestId('rate-1'), { target: { value: '100' } })
    fireEvent.change(screen.getByTestId('rate-2'), { target: { value: '180' } })

    await userEvent.click(screen.getByText('common.actions.save'))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled()
    })

    const payload = onSave.mock.calls[0][0]
    expect(payload._rates).toBeDefined()
    expect(payload._rates).toHaveLength(2)
    expect(payload._rates[0]).toMatchObject({ people_count: 1, price_per_day: 100 })
    expect(payload._rates[1]).toMatchObject({ people_count: 2, price_per_day: 180 })
  })

  it('does NOT include _rates when rates section is closed', async () => {
    const onSave = vi.fn()
    const onClose = vi.fn()

    render(<EditRoomModal isOpen={true} room={null} onClose={onClose} onSave={onSave} />)

    await waitFor(() => {
      expect(screen.getByText('rooms.form.name')).toBeInTheDocument()
    })

    const textInputs = screen.getAllByRole('textbox')
    await userEvent.type(textInputs[0], 'Room Y')

    await userEvent.click(screen.getByText('common.actions.save'))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled()
    })

    const payload = onSave.mock.calls[0][0]
    expect(payload._rates).toBeUndefined()
  })

  it('loads existing rates when editing a room', async () => {
    const rateSvc = await import('@services/roomRates')
    rateSvc.__mocks.listRatesMock.mockResolvedValueOnce([
      { id: 'rate-1', room_id: 'r-1', people_count: 1, price_per_day: 50 },
      { id: 'rate-2', room_id: 'r-1', people_count: 2, price_per_day: 90 },
    ])

    const room = { id: 'r-1', name: 'Suite', number: '201', room_category_id: null, beds: 2, capacity: 2, active: true, notes: null }

    render(<EditRoomModal isOpen={true} room={room} onClose={vi.fn()} onSave={vi.fn()} />)

    await waitFor(() => {
      expect(rateSvc.__mocks.listRatesMock).toHaveBeenCalledWith('r-1')
    })

    await userEvent.click(screen.getByText('common.pricing.show_rates'))

    await waitFor(() => {
      expect((screen.getByTestId('rate-1') as HTMLInputElement).value).toBe('50')
      expect((screen.getByTestId('rate-2') as HTMLInputElement).value).toBe('90')
    })
  })

  it('shows skeleton while loading rates', async () => {
    const rateSvc = await import('@services/roomRates')
    let resolveRates: (v: any) => void
    rateSvc.__mocks.listRatesMock.mockImplementationOnce(
      () => new Promise((resolve) => { resolveRates = resolve })
    )

    const room = { id: 'r-1', name: 'Suite', number: '201', room_category_id: null, beds: 2, capacity: 2, active: true, notes: null }

    render(<EditRoomModal isOpen={true} room={room} onClose={vi.fn()} onSave={vi.fn()} />)

    // skeleton-fields is in the DOM (inside collapsed rate section) while loading
    expect(screen.getByTestId('skeleton-fields')).toBeInTheDocument()

    // resolve the rates promise
    resolveRates!([])

    await waitFor(() => {
      expect(screen.queryByTestId('skeleton-fields')).not.toBeInTheDocument()
    })
  })

  it('handles rate loading failure gracefully', async () => {
    const rateSvc = await import('@services/roomRates')
    rateSvc.__mocks.listRatesMock.mockRejectedValueOnce(new Error('rate fail'))

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const room = { id: 'r-1', name: 'Suite', number: '201', room_category_id: null, beds: 2, capacity: 2, active: true, notes: null }

    render(<EditRoomModal isOpen={true} room={room} onClose={vi.fn()} onSave={vi.fn()} />)

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith('Failed to load room rates', expect.any(Error))
    })
    spy.mockRestore()
  })
})
